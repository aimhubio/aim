import os
import time
import uuid

from typing import Dict, Union
from concurrent import futures
from multiprocessing import Process

import aim.ext.transport.remote_router_pb2 as rpc_messages
import aim.ext.transport.remote_router_pb2_grpc as remote_router_pb2_grpc

from aim.ext.transport.config import AIM_RT_MAX_MESSAGE_SIZE, AIM_RT_DEFAULT_MAX_MESSAGE_SIZE


def _wait_forever(router, worker_pool):
    try:
        while True:
            time.sleep(24 * 60 * 60)  # sleep for a day
    except KeyboardInterrupt:
        # stop workers
        for worker_config in worker_pool.values():
            worker_config['process'].join()
        router.stop(None)


def _get_handler():
    return str(uuid.uuid4())


class ResourceTypeRegistry:
    def __init__(self):
        self._registry: Dict[str, type] = {}

    def register(self, type_name: str, resource_getter: Union[type, callable]):
        self._registry[type_name] = resource_getter

    def __getitem__(self, type_name: str):
        return self._registry[type_name]


class UnauthorizedRequestError(RuntimeError):
    pass


class RemoteRouterServicer(remote_router_pb2_grpc.RemoteRouterServiceServicer):
    worker_state_pool = dict()

    def get_version(self, request: rpc_messages.VersionRequest, _context):
        from aim.__version__ import __version__ as aim_version

        return rpc_messages.VersionResponse(version=aim_version,
                                            status=rpc_messages.VersionResponse.Status.OK)

    def get_worker_address(self, request: rpc_messages.WorkerAddressRequest, _context):
        sorted_workers_pool = {k: v for k, v in sorted(RemoteRouterServicer.worker_state_pool.items(),
                                                       key=lambda item: len(item[1]['client_uris']))}
        worker_address = next(iter(sorted_workers_pool))
        RemoteRouterServicer.worker_state_pool[worker_address]['client_uris'].append(request.client_uri)

        return rpc_messages.WorkerAddressResponse(address=worker_address,
                                                  status=rpc_messages.WorkerAddressResponse.Status.OK)

    def client_disconnect(self, request: rpc_messages.ClientDisconnectRequest, _context):
        client_uri = request.client_uri
        for worker_state in RemoteRouterServicer.worker_state_pool.values():
            if client_uri in worker_state:
                worker_state.remove(client_uri)

        return rpc_messages.ClientDisconnectResponse(status=rpc_messages.ClientDisconnectResponse.Status.OK)


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
    from aim.ext.transport.server import run_server
    for i in range(1, workers+1):
        worker_port = port + i
        worker_address = f'{host}:{worker_port}'
        worker_process = Process(target=run_server, args=(host, worker_port, ssl_keyfile, ssl_certfile))
        worker_process.start()
        RemoteRouterServicer.worker_state_pool[worker_address] = {
            'process': worker_process,
            'client_uris': []
        }

    router.start()

    _wait_forever(router, RemoteRouterServicer.worker_state_pool)
