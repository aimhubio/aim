import datetime

from multiprocessing import Process
from typing import Optional

import aim.ext.transport.proto.remote_tracking_pb2 as rpc_messages
import aim.ext.transport.proto.remote_tracking_pb2_grpc as remote_tracking_pb2_grpc
from aim.ext.cleanup import AutoClean


class RemoteWorkerAutoClean(AutoClean['RemoteWorker']):
    PRIORITY = 120

    def __init__(self, instance: 'RemoteWorker'):
        super().__init__(instance)
        self.worker_process = instance.worker_process

    def _close(self) -> None:
        self.worker_process.join()


class RemoteWorker:
    WORKER_START_GRACE_PERIOD = datetime.timedelta(minutes=5)

    def __init__(self, target_f, *, host, port, index, ssl_keyfile=None, ssl_certfile=None):
        self._resources: Optional[RemoteWorkerAutoClean] = None
        self.worker_process = Process(target=target_f, args=(host, port, ssl_keyfile, ssl_certfile))
        self._host = host
        self._port = port
        self._idx = index
        self._ssl_keyfile = ssl_keyfile
        self._ssl_certfile = ssl_certfile
        self._start_time = None
        self._clients = []
        self._resources = RemoteWorkerAutoClean(self)

    def start(self):
        self.worker_process.start()
        self._start_time = datetime.datetime.now()

    def stop(self):
        self.worker_process.join()

    def restart(self):
        if datetime.datetime.now() - self.start_time > self.WORKER_START_GRACE_PERIOD:
            self.stop()
            self.start()

    def add_client(self, client_uri):
        self._clients.append(client_uri)

    def remove_client(self, client_uri):
        if client_uri in self._clients:
            self._clients.remove(client_uri)

    @property
    def clients(self):
        return self._clients

    @property
    def start_time(self):
        return self._start_time

    @property
    def host(self):
        return self._host

    @property
    def port(self):
        return str(self._port)

    @property
    def address(self):
        return f'{self._host}:{self._port}'

    @property
    def client_count(self):
        return len(self._clients)

    @property
    def index(self):
        return str(self._idx)

    def cleanup_client_resources(self, client_uri):
        import grpc

        if self._ssl_certfile:
            with open(self._ssl_certfile, 'rb') as f:
                root_certificates = grpc.ssl_channel_credentials(f.read())
            _remote_worker_channel = grpc.secure_channel(self.address, root_certificates)
        else:
            _remote_worker_channel = grpc.insecure_channel(self.address)

        _remote_worker_stub = remote_tracking_pb2_grpc.RemoteTrackingServiceStub(_remote_worker_channel)
        request = rpc_messages.ClientResourceCleanupRequest(client_uri=client_uri)
        _remote_worker_stub.cleanup_client_resources(request)


class LocalWorker(RemoteWorker):
    def __init__(self, target_f, *, host, port, index, ssl_keyfile=None, ssl_certfile=None):
        self._resources: Optional[RemoteWorkerAutoClean] = None
        self._host = host
        self._port = port
        self._idx = index
        self._ssl_keyfile = ssl_keyfile
        self._ssl_certfile = ssl_certfile
        self._start_time = None
        self._clients = []

    def start(self):
        self._start_time = datetime.datetime.now()

    def stop(self):
        pass

    def restart(self):
        self.start()
