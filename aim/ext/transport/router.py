import datetime

from typing import List, TYPE_CHECKING

import aim.ext.transport.remote_router_pb2 as router_rpc
import aim.ext.transport.remote_router_pb2_grpc as router_pb2_grpc

from aim.ext.transport.message_utils import build_exception

if TYPE_CHECKING:
    from aim.ext.transport.worker import RemoteWorker


class RemoteRouterServicer(router_pb2_grpc.RemoteRouterServiceServicer):
    client_heartbeat_pool = dict()

    def __init__(self, worker_pool: List['RemoteWorker']):
        self.worker_pool = worker_pool

    def new_client(self, client_uri):
        sorted_workers_pool = sorted(self.worker_pool, key=lambda w: w.client_count)

        worker = sorted_workers_pool[0]
        worker.add_client(client_uri)
        return worker

    def get_version(self, request: router_rpc.VersionRequest, _context):
        from aim.__version__ import __version__ as aim_version

        return router_rpc.VersionResponse(version=aim_version,
                                          status=router_rpc.VersionResponse.Status.OK)

    def client_heartbeat(self, request: router_rpc.HeartbeatRequest, _context):
        try:
            client_uri = request.client_uri
            self.client_heartbeat_pool[client_uri] = datetime.datetime.now().timestamp()
            return router_rpc.HeartbeatResponse(status=router_rpc.HeartbeatResponse.Status.OK)
        except Exception as e:
            return router_rpc.HeartbeatResponse(
                status=router_rpc.HeartbeatRequest.Status.ERROR,
                exception=build_exception(e),
            )

    def connect(self, request: router_rpc.ConnectRequest, _context):
        try:
            worker = self.new_client(request.client_uri)
            return router_rpc.ConnectResponse(port=worker.port,
                                              status=router_rpc.ConnectResponse.Status.OK)
        except Exception as e:
            return router_rpc.ConnectResponse(status=router_rpc.ConnectResponse.Status.ERROR,
                                              exception=build_exception(e))

    def reconnect(self, request: router_rpc.ReconnectRequest, _context):
        try:
            client_uri = request.client_uri
            for worker in self.worker_pool:
                if client_uri in worker.clients:
                    worker.restart()
                    return router_rpc.ReconnectResponse(port=worker.port,
                                                        status=router_rpc.ReconnectResponse.Status.OK)
            # if client wasn't found in the list of clients of any worker fallback to connection logic
            worker = self.new_client(client_uri)
            return router_rpc.ReconnectResponse(port=worker.port,
                                                status=router_rpc.ReconnectResponse.Status.OK)
        except Exception as e:
            return router_rpc.ReconnectResponse(status=router_rpc.ReconnectResponse.Status.ERROR,
                                                exception=build_exception(e))

    def disconnect(self, request: router_rpc.DisconnectRequest, _context):
        try:
            client_uri = request.client_uri
            for worker in self.worker_pool:
                worker.remove_client(client_uri)

            return router_rpc.DisconnectResponse(status=router_rpc.DisconnectResponse.Status.OK)
        except Exception as e:
            return router_rpc.DisconnectResponse(status=router_rpc.DisconnectResponse.Status.ERROR,
                                                 exception=build_exception(e))
