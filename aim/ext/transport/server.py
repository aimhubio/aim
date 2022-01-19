import time
import uuid
from typing import Dict, Union

from concurrent import futures
import grpc
import aim.ext.transport.remote_tracking_pb2 as rpc_messages
import aim.ext.transport.remote_tracking_pb2_grpc as remote_tracking_pb2_grpc

from aim.ext.transport.message_utils import pack_stream, unpack_stream, build_exception, ResourceObject
from aim.ext.transport.handlers import get_tree, get_structured_run
from aim.storage.treeutils import encode_tree, decode_tree


def _wait_forever(server):
    try:
        while True:
            time.sleep(24 * 60 * 60)  # sleep for a day
    except KeyboardInterrupt:
        server.stop(None)


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


class RemoteTrackingServicer(remote_tracking_pb2_grpc.RemoteTrackingServiceServicer):
    resource_pool = dict()
    registry = ResourceTypeRegistry()
    count = 0

    def get_resource(self, request: rpc_messages.ResourceRequest, context):
        resource_handler = _get_handler()
        try:
            resource_cls = self.registry[request.resource_type]
            if len(request.args) > 0:
                res = resource_cls(*request.args)
            else:
                res = resource_cls()

            self.resource_pool[resource_handler] = (request.client_uri, res)
            return rpc_messages.ResourceResponse(handler=resource_handler,
                                                 status=rpc_messages.ResourceResponse.Status.OK)
        except Exception as e:
            try:
                # clean up resource_pool
                # because no one will call release_resource in case of Exception
                del self.resource_pool[resource_handler]
            except KeyError:
                pass

            return rpc_messages.ResourceResponse(
                handler=None,
                status=rpc_messages.ResourceResponse.Status.ERROR,
                exception=build_exception(e),
            )

    def release_resource(self, request: rpc_messages.ReleaseResourceRequest, context):
        try:
            resource_handler = request.handler
            client_uri = request.client_uri
            if not self._verify_resource_handler(resource_handler, client_uri):
                raise UnauthorizedRequestError()

            del self.resource_pool[resource_handler]
            return rpc_messages.ReleaseResourceResponse(status=rpc_messages.ReleaseResourceResponse.Status.OK)
        except Exception as e:
            # Should we clean ed resource_pool in case of exceptions? what if UnauthorizedRequest?
            # del self.resource_pool[resource_handler]
            return rpc_messages.ReleaseResourceResponse(
                status=rpc_messages.ReleaseResourceResponse.Status.ERROR,
                exception=build_exception(e),
            )

    def run_instruction(self, request_iterator, context) -> rpc_messages.InstructionResponse:
        try:
            header = next(request_iterator)
            assert header.WhichOneof('instruction') == 'header'

            resource_handler = header.header.handler
            client_uri = header.header.client_uri
            if not self._verify_resource_handler(resource_handler, client_uri):
                raise UnauthorizedRequestError()

            args = decode_tree(unpack_stream(request_iterator))
            checked_args = []
            for arg in args:
                if isinstance(arg, ResourceObject):
                    handler = arg.storage['handler']
                    if not self._verify_resource_handler(handler, client_uri):
                        raise UnauthorizedRequestError()
                    checked_args.append(self.resource_pool[handler][1])
                else:
                    checked_args.append(arg)
            method_name = header.header.method_name
            resource = self.resource_pool[resource_handler][1]
            if method_name.endswith('.setter'):
                attr_name = method_name.split('.')[0]
                setattr(resource, attr_name, checked_args[0])
                result = None
            else:
                attr = getattr(resource, method_name)
                if callable(attr):
                    result = attr(*checked_args)
                else:
                    result = attr

            yield rpc_messages.InstructionResponse(header=rpc_messages.ResponseHeader(
                version=0.1,
                status=rpc_messages.ResponseHeader.Status.OK
            ))
            for chunk in pack_stream(encode_tree(result)):
                yield rpc_messages.InstructionResponse(message=chunk)

        except Exception as e:
            yield rpc_messages.InstructionResponse(header=rpc_messages.ResponseHeader(
                version=0.1,
                status=rpc_messages.ResponseHeader.Status.ERROR,
                exception=build_exception(e),
            ))

    def _verify_resource_handler(self, resource_handler, client_uri):
        res_info = self.resource_pool.get(resource_handler, None)
        if res_info and res_info[0] == client_uri:
            return True
        return False


def run_server(host, port, workers=1, ssl_keyfile=None, ssl_certfile=None):
    RemoteTrackingServicer.registry.register('TreeView', get_tree)
    RemoteTrackingServicer.registry.register('StructuredRun', get_structured_run)
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=workers))
    remote_tracking_pb2_grpc.add_RemoteTrackingServiceServicer_to_server(RemoteTrackingServicer(), server)

    if ssl_keyfile and ssl_certfile:
        with open(ssl_keyfile, 'rb') as f:
            private_key = f.read()
        with open(ssl_certfile, 'rb') as f:
            certificate_chain = f.read()
        server_credentials = grpc.ssl_server_credentials([(private_key, certificate_chain,)])
        server.add_secure_port(f'{host}:{port}', server_credentials)
    else:
        server.add_insecure_port(f'{host}:{port}')

    server.start()
    _wait_forever(server)
