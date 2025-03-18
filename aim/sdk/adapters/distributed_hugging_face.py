import os

from aim.ext.resource.stat import Stat


try:
    import accelerate.utils.environment
except ImportError:
    raise RuntimeError(
        'This contrib module requires HuggingFace Accelerate to be installed. '
        'Please install it with command: \n pip install accelerate'
    )

import copy
import json
import logging
import select
import socket
import struct
import threading
import time
import typing

import aim
import aim.ext.resource
import aim.hugging_face
import aim.sdk.configs


class IncompletePackageError(Exception):
    pass


class IncompleteHeaderError(IncompletePackageError):
    pass


class IncompleteDataError(IncompletePackageError):
    pass


def packet_encode(usage: typing.Dict[str, typing.Any]) -> bytes:
    data = json.dumps(usage)
    header = len(data).to_bytes(4, 'big')
    packet = b''.join((header, struct.pack(f'!{len(data)}s', data.encode('utf-8'))))
    return packet


def packet_decode(packet: bytes) -> typing.Dict[str, typing.Any]:
    length = int.from_bytes(packet[:4], 'big')
    raw = struct.unpack_from(f'!{length}s', packet, 4)[0]
    decoded = json.loads(raw)
    return decoded


class ResourceTrackerForwarder(aim.ext.resource.ResourceTracker):
    def _track(self, stat: Stat):
        # Instead of tracking individual system metrics, forward the entire update to the MetricsReporter
        # in turn, the MetricsReporter will create a packet ouf of Stat and its context (rank, world_size, etc).
        # Next, it'll send that packet to the MetricsReceiver which will then push the data to the Aim server
        self._tracker()(stat)


class MetricsReporter:
    def __init__(
        self,
        host: str,
        port: int,
        node_rank: int,
        rank: int,
        interval: typing.Union[int, float],
    ):
        self.client: typing.Optional[socket.socket] = None

        self.node_rank = node_rank
        self.rank = rank
        self.log = logging.getLogger(f'MetricsReporter{rank}')

        self._connect(host=host, port=port)
        self.tracker = ResourceTrackerForwarder(tracker=self, interval=interval, capture_logs=False)

    def start(self):
        self.tracker.start()

    def stop(self):
        if self.tracker._shutdown is False:
            self.tracker.stop()
        if self.client is not None:
            self.client.close()
        self.client = None

    def _connect(
        self,
        host: str,
        port: int,
        connection_timeout: int = 60 * 10,
        retry_seconds: int = 5,
    ):
        start = time.time()

        while time.time() - start <= connection_timeout:
            # This should deal with both ipv4 and ipv6 hosts
            for family, socktype, proto, canonname, sa in socket.getaddrinfo(host, port, proto=socket.SOL_TCP):
                self.client = socket.socket(family, socktype, proto)
                try:
                    self.client.connect(sa)
                    return
                except (ConnectionRefusedError, OSError) as e:
                    self.client.close()
                    self.log.info(
                        f'Could not connect to main worker due to {e} - will retry in {retry_seconds} seconds'
                    )
            time.sleep(retry_seconds)

        raise ConnectionError(f'Could not connect to server {host}:{port} after {connection_timeout} seconds')

    def __call__(self, stat: aim.ext.resource.tracker.Stat):
        if self.client is None:
            self.log.info('Connection has already closed, will not propagate this system metrics snapshot')
            return

        # This is invoked by @self.tracker
        raw = {
            'stat': stat.stat_item.to_dict(),
            'worker': {
                'node_rank': self.node_rank,
                'rank': self.rank,
            },
        }
        self.log.debug(f'Send {raw}')

        packet = packet_encode(raw)
        try:
            self.client.sendall(packet)
        except BrokenPipeError:
            self.log.info(
                f'BrokenPipeError while transmitting system metrics {raw} - will stop recording system metrics'
            )
            try:
                self.stop()
            except RuntimeError as e:
                if e.args[0] != 'cannot join current thread':
                    # Calling stop() causes self.tracker() to try to join this thread. In turn that raises
                    # this RuntimeError
                    raise
        except Exception as e:
            self.log.info(f'{e} while transmitting system metrics {raw} - will ignore exception')


class MetricsReceiver:
    def __init__(
        self,
        host: str,
        port: int,
        num_workers: int,
        connection_timeout: int,
    ):
        self.tracker: typing.Optional[
            typing.Callable[
                [
                    typing.Dict[str, typing.Any],
                    typing.Dict[str, typing.Any],
                ],
                None,
            ]
        ] = None

        self.clients: typing.List[socket.socket] = []
        self.log = logging.getLogger('MetricsReceiver')
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        self._wait_workers(
            host=host,
            port=port,
            num_workers=num_workers,
            connection_timeout=connection_timeout,
        )

        self.running = True
        self.thread: typing.Optional[threading.Thread] = None

    def start(
        self,
        tracker: typing.Callable[
            [
                typing.Dict[str, typing.Any],
                typing.Dict[str, typing.Any],
            ],
            None,
        ],
    ):
        self.tracker = tracker
        self.running = True

        self.thread = threading.Thread(target=self._collect_metrics, daemon=True)
        self.thread.start()

    def stop(self):
        if self.running:
            self.running = False
            self.thread.join()

    def _recv(self, sock: socket.socket, length: int) -> typing.Optional[bytes]:
        data = b''
        retries = 0
        while len(data) < length and retries < 10:
            buf = sock.recv(length - len(data))
            data += buf
            retries += 1

        if len(data) < length:
            if len(data) > 0:
                raise IncompletePackageError()
            # If recv() returned b'' then the client disconnected
            return None

        return data

    def _recv_packet(self, sock: socket.socket) -> typing.Optional[typing.Dict[str, typing.Any]]:
        try:
            header = self._recv(sock, 4)

            if header is None:
                # The client disconnected
                return None

            length = int.from_bytes(header, 'big')
        except IncompletePackageError:
            raise IncompleteHeaderError()
        try:
            data = self._recv(sock, length)
            if len(data) > 0:
                return json.loads(data)
        except IncompletePackageError:
            raise IncompleteDataError()

    def _collect_metrics(self):
        while self.running:
            read, _write, _error = select.select(self.clients, [], [], 5.0)
            for client in typing.cast(typing.List[socket.socket], read):
                try:
                    packet = self._recv_packet(client)
                except IncompletePackageError as e:
                    self.log.info(f'Error {e} while receiving update - will assume this is a transient error')
                    continue

                if packet:
                    self.tracker(packet['stat'], packet['worker'])
                else:
                    self.log.info('Client disconnected')
                    client.close()
                    self.clients.remove(client)

    def _wait_workers(self, host: str, port: int, num_workers: int, connection_timeout: float):
        # This may raise an exception, don't catch it here and let it flow to the caller
        self.server.bind((host, port))
        self.server.listen(num_workers)

        # We're actually going to pause here, till we get all clients OR we run out of time

        start = time.time()
        self.log.info(f'Waiting for {num_workers} workers to connect')
        # Block for 5 seconds while waiting for new connections
        while time.time() - start <= connection_timeout:
            read, _write, _error = select.select([self.server], [], [], 5.0)
            for server in read:
                client, _client_address = server.accept()
                self.clients.append(client)
                self.log.info(f'Client {len(self.clients)}/{num_workers} connected')

                if len(self.clients) == num_workers:
                    return

        self.server.close()

        raise ConnectionError(f'{num_workers - len(self.clients)} out of {num_workers} total clients did not connect')


class AimCallback(aim.hugging_face.AimCallback):
    def __init__(
        self,
        main_port: int,
        repo: typing.Optional[str] = None,
        experiment: typing.Optional[str] = None,
        system_tracking_interval: typing.Optional[int] = aim.ext.resource.DEFAULT_SYSTEM_TRACKING_INT,
        log_system_params: typing.Optional[bool] = True,
        capture_terminal_logs: typing.Optional[bool] = True,
        main_addr: typing.Optional[str] = None,
        distributed_information: typing.Optional[accelerate.utils.environment.CPUInformation] = None,
        connection_timeout: int = 60 * 5,
        workers_only_on_rank_0: bool = True,
    ):
        """A HuggingFace TrainerCallback which registers the system metrics of all workers involved in the training
        under a single Aim run.

        This code initializes aim.hugging_face.AimCallback() only on rank 0 - otherwise we'd end up with multiple
        Aim runs.

        Args:
            main_port (:obj:`int`): Configures the port that the main worker will listen on. If this is None
                then the code will raise an exception.
            repo (:obj:`Union[Repo,str]`, optional): Aim repository path or Repo object to which Run object is bound.
                If skipped, default Repo is used.
            experiment (:obj:`str`, optional): Sets Run's `experiment` property. 'default' if not specified.
                Can be used later to query runs/sequences.
            system_tracking_interval (:obj:`int`, optional): Sets the tracking interval in seconds for system usage
                metrics (CPU, Memory, etc.). Set to `None` to disable system metrics tracking.
            log_system_params (:obj:`bool`, optional): Enable/Disable logging of system params such as installed
                packages, git info, environment variables, etc.
            main_addr (:obj:`str`, optional): The address of the main worker. If this is None then the code will
                auto-discover it from the environment variable MASTER_ADDR. If this parameter cannot be resolved
                to a non-empty value the method will raise an exception.
            distributed_information (:obj:`str`, accelerate.utils.environment.CPUInformation): information about the
                CPU in a distributed environment. If None, the code parses environment variables to auto create it.
                See accelerate.utils.get_cpu_distributed_information() for more details
            connection_timeout (:obj:`int`, optional): Maximum seconds to wait for the auxiliary workers to connect.
                workers_only_on_rank_0 (:obj:`bool`): When set to true, only treat processes with local_rank 0 as
                workers. Setting this to False, only makes sense when debugging the AimCallback() code.

        Raises:
            ConnectionError:
                If unable auxiliary workers are unable to connect to main worker
        """
        if main_addr is None:
            main_addr = os.environ.get('MASTER_ADDR')

        if not main_addr:
            raise ValueError('main_addr cannot be empty')

        if not main_port or main_port < 0:
            raise ValueError('main_port must be a positive number')

        if distributed_information is None:
            distributed_information = accelerate.utils.get_cpu_distributed_information()

        self.distributed_information = distributed_information
        self.connection_timeout = connection_timeout

        self.listening_socket: typing.Optional[socket.socket] = None

        self.metrics_reporter: typing.Optional[MetricsReporter] = None
        self.metrics_receiver: typing.Optional[MetricsReceiver] = None

        self._run: typing.Optional[aim.Run] = None
        self.log = logging.getLogger('CustomAimCallback')

        if not workers_only_on_rank_0:
            # This is primarily for debugging. It enables the creation of multiple auxiliary workers on a single node
            auxiliary_workers = self.distributed_information.world_size
        else:
            auxiliary_workers = self.distributed_information.world_size // self.distributed_information.local_world_size

        # Instantiate a MetricsReporter for all workers which are not rank 0
        if (
            self.distributed_information.rank is not None
            and self.distributed_information.rank > 0
            and (not workers_only_on_rank_0 or self.distributed_information.local_rank == 0)
            and system_tracking_interval is not None
        ):
            if workers_only_on_rank_0:
                node_rank = distributed_information.rank // distributed_information.local_world_size
            else:
                node_rank = distributed_information.rank

            self.metrics_reporter = MetricsReporter(
                host=main_addr,
                port=main_port,
                rank=self.distributed_information.rank,
                node_rank=node_rank,
                interval=system_tracking_interval,
            )

            self.log.info(f'Distributed worker {self.distributed_information.rank} connected')
        elif self.distributed_information.rank == 0:
            # When running as the main worker, we initialize aim as usual. If there're multiple
            # auxiliary workers, we also start a listening server. The auxiliary workers will connect
            # to this server and periodically send over their system metrics
            super().__init__(
                repo,
                experiment,
                system_tracking_interval,
                log_system_params,
                capture_terminal_logs,
            )

            if auxiliary_workers > 1 and main_port is not None and system_tracking_interval is not None:
                self.log.info(f'There are {auxiliary_workers} workers')

                self.metrics_receiver = MetricsReceiver(
                    # Bind to 0.0.0.0 so that we can accept connections coming in from any interface
                    host='0.0.0.0',
                    port=main_port,
                    num_workers=auxiliary_workers - 1,
                    connection_timeout=self.connection_timeout,
                )

                self.metrics_receiver.start(self._push_auxiliary_worker_metrics)

    def _push_auxiliary_worker_metrics(
        self,
        stat: typing.Dict[str, typing.Any],
        worker_info: typing.Dict[str, typing.Any],
    ):
        """Utility method which pushes the system metrics of an auxiliary worker to Aim

        Args:
            stat: (:obj:`typing.Dict[str, typing.Any]`): A dictionary representation of
                aim.ext.resource.stat.Stat
            worker_info (:obj:`typing.Dict[str, typing.Any]`): A dictionary which represents the context of a
                worker. For example, it can contain the fields {"rank": int, "node_rank": int}
        """
        # TODO: Investigate whether it's better to spin up a dedicated RunTracker here or not
        if self._run is None:
            self.log.info(f'The aim Run is inactive, will not register these metrics from {worker_info}')
            return

        tracker = self._run._tracker
        context = copy.deepcopy(worker_info)

        for resource, usage in stat['system'].items():
            tracker(
                usage,
                name='{}{}'.format(
                    aim.ext.resource.configs.AIM_RESOURCE_METRIC_PREFIX,
                    resource,
                ),
                context=context,
            )

        # Store GPU stats
        for gpu_idx, gpu in enumerate(stat['gpus']):
            for resource, usage in gpu.items():
                context = copy.deepcopy(worker_info)
                context.update({'gpu': gpu_idx})

                tracker(
                    usage,
                    name='{}{}'.format(
                        aim.ext.resource.configs.AIM_RESOURCE_METRIC_PREFIX,
                        resource,
                    ),
                    context=context,
                )

    def on_train_begin(self, args, state, control, model=None, **kwargs):
        super().on_train_begin(args, state, control, model, **kwargs)

        if self.metrics_reporter:
            self.metrics_reporter.start()

    def close(self):
        try:
            super().close()
        finally:
            if self.metrics_receiver is not None:
                self.metrics_receiver.stop()
            if self.metrics_reporter is not None:
                self.metrics_reporter.stop()
