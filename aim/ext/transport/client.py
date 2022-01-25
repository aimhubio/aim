import os
import uuid
from copy import deepcopy
import grpc
import threading
import aim.ext.transport.remote_tracking_pb2 as rpc_messages
import aim.ext.transport.remote_tracking_pb2_grpc as remote_tracking_pb2_grpc

from aim.ext.transport.message_utils import pack_stream, unpack_stream, raise_exception
from aim.ext.transport.config import AIM_CLIENT_SSL_CERTIFICATES_FILE
from aim.ext.task_queue.queue import TaskQueue
from aim.storage.treeutils import encode_tree, decode_tree


class Client:
    _thread_local = threading.local()

    _queue = TaskQueue('metric_tracking', max_backlog=10_000_000)

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

        self._thread_local.atomic_instructions = None

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

    def run_instruction(self, resource, method, args=(), is_write_only=False):
        args = deepcopy(args)

        # self._thread_local can be empty in the 'clean up' phase.
        if getattr(self._thread_local, 'atomic_instructions', None) is not None:
            assert is_write_only
            self._thread_local.atomic_instructions.append((resource, method, args))
            return

        if is_write_only:
            self._queue.register_task(
                self._run_write_instructions, [(resource, method, args)])
            return

        return self._run_read_instructions(resource, method, args)

    def _run_read_instructions(self, resource, method, args):
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

        # TODO [AD] make this atomic in case of parallel write from different thread?
        # TODO [AD] make queue per run? do we need it?
        self._queue.join()
        resp = self.remote.run_instruction(message_stream_generator())
        status_msg = next(resp)

        assert status_msg.WhichOneof('instruction') == 'header'
        if status_msg.header.status == rpc_messages.ResponseHeader.Status.ERROR:
            raise_exception(status_msg.header.exception)
        return decode_tree(unpack_stream(resp))

    def _run_write_instructions(self, instructions):
        stream = pack_stream(encode_tree(instructions))

        def message_stream_generator():
            for chunk in stream:
                yield rpc_messages.WriteInstructionsRequest(
                    version='0.1',
                    client_uri=self.uri,
                    message=chunk
                )

        response = self.remote.run_write_instructions(message_stream_generator())
        if response.status == rpc_messages.WriteInstructionsResponse.Status.ERROR:
            raise_exception(response.header.exception)

    def init_tracking(self):
        self._thread_local.atomic_instructions = []

    def flush_tracking(self):
        if self._thread_local.atomic_instructions is None:
            return

        self._queue.register_task(
            self._run_write_instructions, deepcopy(self._thread_local.atomic_instructions))
        self._thread_local.atomic_instructions = None

    @property
    def remote(self):  # access to low-level interface
        return self._remote_stub

    @property
    def uri(self):
        return self._id
