from typing import Dict, Union

import aim.ext.transport.proto.remote_tracking_pb2 as tracking_rpc
import aim.ext.transport.proto.remote_tracking_pb2_grpc as tracking_pb2_grpc
import aim.ext.transport.message_utils as utils

from aim.ext.transport.handlers import get_handler
from aim.storage.treeutils import encode_tree, decode_tree


class ResourceTypeRegistry:
    def __init__(self):
        self._registry: Dict[str, type] = {}

    def register(self, type_name: str, resource_getter: Union[type, callable]):
        self._registry[type_name] = resource_getter

    def __getitem__(self, type_name: str):
        return self._registry[type_name]


class RemoteTrackingServicer(tracking_pb2_grpc.RemoteTrackingServiceServicer):
    resource_pool = dict()

    def __init__(self, resource_registry: ResourceTypeRegistry):
        self.registry = resource_registry

    def cleanup_client_resources(self, request: tracking_rpc.ClientResourceCleanupRequest, _context):
        dead_client_uri = request.client_uri

        resource_handlers = list(self.resource_pool.keys())
        for handler in resource_handlers:
            (client_uri, _) = self.resource_pool[handler]
            if dead_client_uri == client_uri:
                del self.resource_pool[handler]

        return tracking_rpc.ResourceResponse(status=tracking_rpc.ResourceResponse.Status.OK)

    def get_resource(self, request: tracking_rpc.ResourceRequest, _context):
        if not request.handler:
            resource_handler = get_handler()
        else:
            resource_handler = request.handler

        try:
            resource_cls = self.registry[request.resource_type]
            if len(request.args) > 0:
                kwargs = decode_tree(utils.unpack_args(request.args))
                checked_kwargs = {}
                for argname, arg in kwargs.items():
                    if isinstance(arg, utils.ResourceObject):
                        handler = arg.storage['handler']
                        self._verify_resource_handler(handler, request.client_uri)
                        checked_kwargs[argname] = self.resource_pool[handler][1].ref
                    else:
                        checked_kwargs[argname] = arg

                res = resource_cls(**checked_kwargs)
            else:
                res = resource_cls()

            self.resource_pool[resource_handler] = (request.client_uri, res)
            return tracking_rpc.ResourceResponse(handler=resource_handler,
                                                 status=tracking_rpc.ResourceResponse.Status.OK)
        except Exception as e:
            try:
                # clean up resource_pool
                # because no one will call release_resource in case of Exception
                del self.resource_pool[resource_handler]
            except KeyError:
                pass

            return tracking_rpc.ResourceResponse(
                handler=None,
                status=tracking_rpc.ResourceResponse.Status.ERROR,
                exception=utils.build_exception(e),
            )

    def release_resource(self, request: tracking_rpc.ReleaseResourceRequest, _context):
        try:
            resource_handler = request.handler
            client_uri = request.client_uri
            self._verify_resource_handler(resource_handler, client_uri)
            del self.resource_pool[resource_handler]
            return tracking_rpc.ReleaseResourceResponse(status=tracking_rpc.ReleaseResourceResponse.Status.OK)
        except Exception as e:
            # Should we clean ed resource_pool in case of exceptions? what if UnauthorizedRequest?
            # del self.resource_pool[resource_handler]
            return tracking_rpc.ReleaseResourceResponse(
                status=tracking_rpc.ReleaseResourceResponse.Status.ERROR,
                exception=utils.build_exception(e),
            )

    def run_instruction(self, request_iterator, _context) -> tracking_rpc.InstructionResponse:
        try:
            header = next(request_iterator)
            assert header.WhichOneof('instruction') == 'header'

            resource_handler = header.header.handler
            client_uri = header.header.client_uri
            self._verify_resource_handler(resource_handler, client_uri)

            args = decode_tree(utils.unpack_stream(request_iterator))
            checked_args = []
            for arg in args:
                if isinstance(arg, utils.ResourceObject):
                    handler = arg.storage['handler']
                    self._verify_resource_handler(handler, client_uri)
                    checked_args.append(self.resource_pool[handler][1].ref)
                else:
                    checked_args.append(arg)

            method_name = header.header.method_name

            resource = self.resource_pool[resource_handler][1].ref
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

            yield tracking_rpc.InstructionResponse(header=tracking_rpc.ResponseHeader(
                version='0.1',
                status=tracking_rpc.ResponseHeader.Status.OK
            ))
            for chunk in utils.pack_stream(encode_tree(result)):
                yield tracking_rpc.InstructionResponse(message=chunk)

        except Exception as e:
            yield tracking_rpc.InstructionResponse(header=tracking_rpc.ResponseHeader(
                version='0.1',
                status=tracking_rpc.ResponseHeader.Status.ERROR,
                exception=utils.build_exception(e),
            ))
            return

    def run_write_instructions(self, request_iterator, _context) -> tracking_rpc.WriteInstructionsResponse:
        try:
            raw_message = []
            client_uri = None  # TODO [AD] move to header interface?
            # TODO [AD] raw_message = [request.message for request in request_iterator]
            for request in request_iterator:
                raw_message.append(request.message)
                client_uri = request.client_uri
            write_instructions = decode_tree(utils.unpack_bytes(raw_message))
            for instruction in write_instructions:
                resource_handler, method_name, args = instruction

                self._verify_resource_handler(resource_handler, client_uri)

                checked_args = []
                for arg in args:
                    if isinstance(arg, utils.ResourceObject):
                        handler = arg.storage['handler']
                        self._verify_resource_handler(handler, client_uri)
                        checked_args.append(self.resource_pool[handler][1].ref)
                    else:
                        checked_args.append(arg)

                resource = self.resource_pool[resource_handler][1].ref
                if method_name.endswith('.setter'):
                    attr_name = method_name.split('.')[0]
                    setattr(resource, attr_name, checked_args[0])
                else:
                    attr = getattr(resource, method_name)
                    assert callable(attr)
                    attr(*checked_args)

            return tracking_rpc.WriteInstructionsResponse(status=tracking_rpc.WriteInstructionsResponse.Status.OK)
        except Exception as e:
            return tracking_rpc.WriteInstructionsResponse(
                version='0.1',
                status=tracking_rpc.WriteInstructionsResponse.Status.ERROR,
                exception=utils.build_exception(e),
            )

    def _verify_resource_handler(self, resource_handler, client_uri):
        res_info = self.resource_pool.get(resource_handler, None)
        if not res_info or res_info[0] != client_uri:
            raise utils.UnauthorizedRequestError(resource_handler)
