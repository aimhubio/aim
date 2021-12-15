import time
import uuid
import struct
from typing import Dict, Iterator, Tuple
import threading

from concurrent import futures
import grpc
import aim.ext.transport.remote_tracking_pb2 as rpc_messages
import aim.ext.transport.remote_tracking_pb2_grpc as remote_tracking_pb2_grpc

from aim.ext.transport.message_utils import pack, unpack, unpack_request_data
from aim.storage.treeutils import encode_tree, decode_tree


def _wait_forever(server):
    try:
        while True:
            time.sleep(24*60*60)  # sleep for a day
    except KeyboardInterrupt:
        server.stop(None)


def _get_handler():
    return str(uuid.uuid4())


class ResourceTypeRegistry:
    def __init__(self):
        self._registry: Dict[str, type] = {}

    def register(self, type_name: str, type_cls: type):
        self._registry[type_name] = type_cls

    def register_factory_method(self, type_name: str, factory_method: callable):
        self._registry[type_name] = factory_method


class UnauthorizedRequestError(RuntimeError):
    pass


class RemoteTrackingServicer(remote_tracking_pb2_grpc.RemoteTrackingServiceServicer):
    resource_pool = dict()
    registry = ResourceTypeRegistry()
    count = 0

    def get_resource(self, request: rpc_messages.ResourceRequest, context):
        resource_cls = self.registry._registry[request.resource_type]
        if len(request.args) > 0:
            res = resource_cls(*request.args)
        else:
            res = resource_cls()
        handler = _get_handler()
        self.resource_pool[handler] = (request.client_uri, res)

        return rpc_messages.ResourceResponse(handler=handler)

    def run_instruction_no_stream(self, request, context) -> rpc_messages.InstructionResponseNoStream:
        resource_handler = request.header.handler
        client_uri = request.header.client_uri
        if not self._verify_resource_handler(resource_handler, client_uri):
            raise UnauthorizedRequestError()

        args = decode_tree(unpack(request.message))
        resource = self.resource_pool[resource_handler][1]
        method = getattr(resource, request.header.method_name)

        if not callable(method):
            raise ValueError(f'{request.header.method_name} is not callable')

        try:
            result = method(*args)
        except Exception as e:
            return rpc_messages.InstructionResponseNoStream(header=rpc_messages.ResponseHeader(
                version=0.1,
                status=1
            ))
        return rpc_messages.InstructionResponseNoStream(
            header=rpc_messages.ResponseHeader(
                version=0.1, status=0,
            ),
            message=pack(encode_tree(result))
        )

    def run_instruction(self, request_iterator, context) -> rpc_messages.InstructionResponse:
        header = next(request_iterator)
        assert header.WhichOneof('instruction') == 'header'

        resource_handler = header.header.handler
        client_uri = header.header.client_uri
        if not self._verify_resource_handler(resource_handler, client_uri):
            raise UnauthorizedRequestError()

        args = decode_tree(unpack_request_data(request_iterator))
        resource = self.resource_pool[resource_handler][1]
        method = getattr(resource, header.header.method_name)

        if not callable(method):
            raise ValueError(f'{header.header.method_name} is not callable')

        try:
            result = method(*args)
        except Exception as e:
            yield rpc_messages.InstructionResponse(header=rpc_messages.ResponseHeader(
                version=0.1,
                status=1
            ))
            return

        yield rpc_messages.InstructionResponse(header=rpc_messages.ResponseHeader(
            version=0.1,
            status=0
        ))
        for chunk in pack(encode_tree(result)):
            yield rpc_messages.InstructionResponse(message=chunk)

    def _verify_resource_handler(self, resource_handler, client_uri):
        res_info = self.resource_pool.get(resource_handler, None)
        if res_info and res_info[0] == client_uri:
            return True
        return False


def run_server():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=1))
    remote_tracking_pb2_grpc.add_RemoteTrackingServiceServicer_to_server(RemoteTrackingServicer(), server)
    server.add_insecure_port('localhost:53800')
    server.start()
    _wait_forever(server)

