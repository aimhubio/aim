import os
import uuid
from copy import deepcopy
import grpc
import aim.ext.transport.remote_tracking_pb2 as rpc_messages
import aim.ext.transport.remote_tracking_pb2_grpc as remote_tracking_pb2_grpc

from aim.ext.transport.message_utils import pack_stream, unpack_stream, raise_exception
from aim.ext.transport.config import AIM_CLIENT_SSL_CERTIFICATES_FILE
from aim.storage.treeutils import encode_tree, decode_tree


class Client:
    def __init__(self, remote_path: str):
        self._id = str(uuid.uuid4())

        ssl_certfile = os.getenv(AIM_CLIENT_SSL_CERTIFICATES_FILE)
        if ssl_certfile:
            with open(ssl_certfile, 'rb') as f:
                root_certificates = grpc.ssl_channel_credentials(f.read())
            self._remote_channel = grpc.secure_channel(remote_path, root_certificates)
        else:
            self._remote_channel = grpc.insecure_channel(remote_path)

        self._remote_stub = remote_tracking_pb2_grpc.RemoteTrackingServiceStub(self._remote_channel)

    def get_resource_handler(self, resource_type, args=()):
        request = rpc_messages.ResourceRequest(
            resource_type=resource_type,
            client_uri=self.uri,
            args=args
        )
        response = self.remote.get_resource(request)
        if response.status == rpc_messages.ResourceResponse.Status.ERROR:
            raise_exception(response.exception)
        return response.handler

    def release_resource(self, resource_handler):
        request = rpc_messages.ReleaseResourceRequest(
            handler=resource_handler,
            client_uri=self.uri
        )
        response = self.remote.release_resource(request)
        if response.status == rpc_messages.ReleaseResourceResponse.Status.ERROR:
            raise_exception(response.exception)

    def run_instruction(self, resource, method, args=()):
        args = deepcopy(args)

        def message_stream_generator():
            header = rpc_messages.InstructionRequest(
                header=rpc_messages.RequestHeader(
                    version='0.1',
                    handler=resource,
                    client_uri=self.uri,
                    method_name=method
                )
            )
            yield header

            stream = pack_stream(encode_tree(args))
            for chunk in stream:
                yield rpc_messages.InstructionRequest(message=chunk)

        resp = self.remote.run_instruction(message_stream_generator())
        status_msg = next(resp)
        assert status_msg.WhichOneof('instruction') == 'header'
        if status_msg.header.status == rpc_messages.ResponseHeader.Status.ERROR:
            raise_exception(status_msg.header.exception)
        return decode_tree(unpack_stream(resp))

    @property
    def remote(self):  # access to low-level interface
        return self._remote_stub

    @property
    def uri(self):
        return self._id
