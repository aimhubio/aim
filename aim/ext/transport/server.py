import os
import time

from typing import Optional
from concurrent import futures

from aim.ext.cleanup import AutoClean

from aim.ext.transport.config import AIM_RT_MAX_MESSAGE_SIZE, AIM_RT_DEFAULT_MAX_MESSAGE_SIZE
from aim.ext.transport.handlers import get_tree, get_structured_run, get_repo, get_lock, get_run_heartbeat
from aim.ext.transport.heartbeat import RPCHeartbeatWatcher
from aim.ext.transport.worker import RemoteWorker, LocalWorker
from aim.ext.transport.health import HealthServicer, health_pb2_grpc
from aim.ext.transport.router import RemoteRouterServicer, router_pb2_grpc
from aim.ext.transport.remote_tracking import RemoteTrackingServicer, tracking_pb2_grpc, ResourceTypeRegistry


def _wait_forever():
    while True:
        time.sleep(24 * 60 * 60)  # sleep for a day


class RPCServerAutoClean(AutoClean['RPCServer']):
    PRIORITY = 150

    def __init__(self, instance: 'RPCServer'):
        super().__init__(instance)
        self.server = instance.server

    def _close(self):
        self.server.stop(grace=None)


class RPCServer:
    def __init__(self):
        import grpc  # temporary workaround for M1 build

        self._resources: Optional[RPCServerAutoClean] = None
        self._server = grpc.server(futures.ThreadPoolExecutor(), options=self._get_grpc_server_options())
        self.resource = RPCServerAutoClean(self)

    def start(self, host, port, ssl_keyfile, ssl_certfile):
        import grpc  # temporary workaround for M1 build

        if ssl_keyfile and ssl_certfile:
            with open(ssl_keyfile, 'rb') as f:
                private_key = f.read()
            with open(ssl_certfile, 'rb') as f:
                certificate_chain = f.read()
            server_credentials = grpc.ssl_server_credentials([(private_key, certificate_chain,)])
            self._server.add_secure_port(f'{host}:{port}', server_credentials)
        else:
            self._server.add_insecure_port(f'{host}:{port}')

        self._server.start()

    @staticmethod
    def _get_grpc_server_options():
        msg_max_size = int(os.getenv(AIM_RT_MAX_MESSAGE_SIZE, AIM_RT_DEFAULT_MAX_MESSAGE_SIZE))
        options = [
            ('grpc.max_send_message_length', msg_max_size),
            ('grpc.max_receive_message_length', msg_max_size)
        ]
        return options

    @property
    def server(self):
        return self._server


def prepare_resource_registry():
    registry = ResourceTypeRegistry()
    registry.register('TreeView', get_tree)
    registry.register('StructuredRun', get_structured_run)
    registry.register('Repo', get_repo)
    registry.register('Lock', get_lock)
    registry.register('RunHeartbeat', get_run_heartbeat)
    return registry


def run_router(host, port, workers=1, ssl_keyfile=None, ssl_certfile=None):
    # start workers
    worker_pool = []

    if workers == 1:
        worker = LocalWorker(lambda: None, host=host, port=port, ssl_keyfile=ssl_keyfile, ssl_certfile=ssl_certfile)
        worker_pool.append(worker)
    else:
        for i in range(1, workers + 1):
            worker_port = port + i
            worker = RemoteWorker(run_worker, host=host, port=worker_port,
                                  ssl_keyfile=ssl_keyfile, ssl_certfile=ssl_certfile)
            worker_pool.append(worker)
            worker.start()

    # start routing RPC server
    server = RPCServer()
    router_pb2_grpc.add_RemoteRouterServiceServicer_to_server(RemoteRouterServicer(worker_pool), server.server)
    health_pb2_grpc.add_HealthServicer_to_server(HealthServicer(), server.server)

    if workers == 1:
        # add worker servicers to router as well
        registry = prepare_resource_registry()
        tracking_pb2_grpc.add_RemoteTrackingServiceServicer_to_server(RemoteTrackingServicer(registry), server.server)

    server.start(host, port, ssl_keyfile, ssl_certfile)

    # start client heartbeat service
    heartbeat_watcher = RPCHeartbeatWatcher(
        RemoteRouterServicer.client_heartbeat_pool,
        worker_pool,
    )
    heartbeat_watcher.start()

    _wait_forever()


def run_worker(host, port, ssl_keyfile=None, ssl_certfile=None):
    # register resource handlers
    registry = prepare_resource_registry()

    # start tracking RPC server
    server = RPCServer()
    tracking_pb2_grpc.add_RemoteTrackingServiceServicer_to_server(RemoteTrackingServicer(registry), server.server)
    server.start(host, port, ssl_keyfile, ssl_certfile)

    _wait_forever()
