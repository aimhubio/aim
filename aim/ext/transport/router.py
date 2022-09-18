import os
import time
import datetime

from concurrent import futures

import aim.ext.transport.remote_router_pb2 as rpc_messages
import aim.ext.transport.remote_router_pb2_grpc as remote_router_pb2_grpc

from aim.ext.transport.message_utils import build_exception
from aim.ext.transport.config import AIM_RT_MAX_MESSAGE_SIZE, AIM_RT_DEFAULT_MAX_MESSAGE_SIZE
from aim.ext.transport.heartbeat import RPCHeartbeatWatcher
from aim.ext.transport.worker import RemoteWorker


def _wait_forever(router, worker_pool, watchers=None):
    try:
        while True:
            time.sleep(24 * 60 * 60)  # sleep for a day
    except KeyboardInterrupt:
        # stop workers
        for worker in worker_pool:
            worker.stop()
        if watchers:
            for watcher in watchers:
                watcher.stop()
        router.stop(None)


class RemoteRouterServicer(remote_router_pb2_grpc.RemoteRouterServiceServicer):
    worker_pool = []
    client_heartbeat_pool = dict()
    WORKER_RESTART_DELTA = 5 * 60

    def connect_client(self, client_uri):
        sorted_workers_pool = sorted(self.worker_pool, key=lambda w: w.client_count)

        worker = sorted_workers_pool[0]
        worker.add_client(client_uri)
        return worker

    def get_version(self, request: rpc_messages.VersionRequest, _context):
        from aim.__version__ import __version__ as aim_version

        return rpc_messages.VersionResponse(version=aim_version,
                                            status=rpc_messages.VersionResponse.Status.OK)

    def client_heartbeat(self, request: rpc_messages.HeartbeatRequest, _context):
        try:
            client_uri = request.client_uri
            self.client_heartbeat_pool[client_uri] = datetime.datetime.now().timestamp()
            return rpc_messages.HeartbeatResponse(status=rpc_messages.HeartbeatResponse.Status.OK)
        except Exception as e:
            return rpc_messages.HeartbeatResponse(
                status=rpc_messages.HeartbeatRequest.Status.ERROR,
                exception=build_exception(e),
            )

    def client_connect(self, request: rpc_messages.ClientConnectRequest, _context):
        try:
            worker = self.connect_client(request.client_uri)
            return rpc_messages.ClientConnectResponse(address=worker.address,
                                                  status=rpc_messages.ClientConnectResponse.Status.OK)
        except Exception as e:
            return rpc_messages.ClientConnectRequest(status=rpc_messages.ClientConnectResponse.Status.ERROR,
                                                     exception=build_exception(e))

    def client_re_connect(self, request: rpc_messages.ClientReConnectRequest, _context):
        try:
            client_uri = request.client_uri
            for worker in self.worker_pool:
                if client_uri in worker.clients:
                    if datetime.datetime.now() - worker.start_time > self.WORKER_RESTART_DELTA:
                        worker.resart()
                    return rpc_messages.ClientReConnectResponse(address=worker.address,
                                                                status=rpc_messages.ClientConnectResponse.Status.OK)
            # if client wasn't found in the list of clients of any worker fallback to connection logic
            worker = self.connect_client(client_uri)
            return rpc_messages.ClientReConnectResponse(address=worker.address,
                                                        status=rpc_messages.ClientReConnectRequest.Status.OK)
        except Exception as e:
            return rpc_messages.ClientReConnectResponse(status=rpc_messages.ClientReConnectResponse.Status.ERROR,
                                                        exception=build_exception(e))

    def client_disconnect(self, request: rpc_messages.ClientDisconnectRequest, _context):
        try:
            client_uri = request.client_uri
            for worker in RemoteRouterServicer.worker_pool:
                worker.remove_client(client_uri)

            return rpc_messages.ClientDisconnectResponse(status=rpc_messages.ClientDisconnectResponse.Status.OK)
        except Exception as e:
            return rpc_messages.ClientDisconnectRequest(status=rpc_messages.ClientDisconnectResponse.Status.ERROR,
                                                        exception=build_exception(e))


def run_router(host, port, workers=1, ssl_keyfile=None, ssl_certfile=None):
    # temporary workaround for M1 build
    import grpc

    msg_max_size = int(os.getenv(AIM_RT_MAX_MESSAGE_SIZE, AIM_RT_DEFAULT_MAX_MESSAGE_SIZE))
    options = [
        ('grpc.max_send_message_length', msg_max_size),
        ('grpc.max_receive_message_length', msg_max_size)
    ]
    router = grpc.server(futures.ThreadPoolExecutor(), options=options)
    remote_router_pb2_grpc.add_RemoteRouterServiceServicer_to_server(RemoteRouterServicer(), router)

    if ssl_keyfile and ssl_certfile:
        with open(ssl_keyfile, 'rb') as f:
            private_key = f.read()
        with open(ssl_certfile, 'rb') as f:
            certificate_chain = f.read()
        server_credentials = grpc.ssl_server_credentials([(private_key, certificate_chain,)])
        router.add_secure_port(f'{host}:{port}', server_credentials)
    else:
        router.add_insecure_port(f'{host}:{port}')

    # start workers
    for i in range(1, workers+1):
        worker_port = port + i
        worker = RemoteWorker(host, worker_port, ssl_keyfile, ssl_certfile)
        worker.start()
        RemoteRouterServicer.worker_pool.append(worker)

    router.start()

    heartbeat_watcher = RPCHeartbeatWatcher(
        RemoteRouterServicer.client_heartbeat_pool,
        RemoteRouterServicer.worker_pool,
    )
    heartbeat_watcher.start()

    _wait_forever(router, RemoteRouterServicer.worker_pool, watchers=[heartbeat_watcher])
