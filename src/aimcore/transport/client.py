import requests
import base64
import logging
import os
import threading
import uuid
import weakref
from copy import deepcopy
from typing import Tuple
from websockets.sync.client import connect

from aimcore.error_handling import handle_exception
from aimcore.transport.message_utils import raise_exception, pack_args, unpack_stream, unpack_args
from aimcore.transport.rpc_queue import RpcQueueWithRetry
from aimcore.transport.heartbeat import HeartbeatSender
from aimcore.transport.config import (
    AIM_CLIENT_QUEUE_MAX_MEMORY,
)
from aim._core.storage.treeutils import encode_tree, decode_tree


DEFAULT_RETRY_INTERVAL = 0.1  # 100 ms
DEFAULT_RETRY_COUNT = 2

logger = logging.getLogger(__name__)


class Client:
    _thread_local = threading.local()

    _queue = RpcQueueWithRetry(
        'remote_tracker', max_queue_memory=os.getenv(AIM_CLIENT_QUEUE_MAX_MEMORY, 1024 * 1024 * 1024),
        retry_count=DEFAULT_RETRY_COUNT, retry_interval=DEFAULT_RETRY_INTERVAL)

    def __init__(self, remote_path: str):
        # temporary workaround for M1 build

        self._id = str(uuid.uuid4())
        if remote_path.endswith('/'):
            remote_path = remote_path[:-1]
        self._remote_path = remote_path

        self._http_protocol = 'http://'
        self._ws_protocol = 'ws://'
        self.protocol_probe()

        self._resource_pool = weakref.WeakValueDictionary()

        self._client_endpoint = f'{self.remote_path}/client'
        self._tracking_endpoint = f'{self.remote_path}/tracking'

        self.connect()

        self._heartbeat_sender = HeartbeatSender(self)
        self._heartbeat_sender.start()
        self._thread_local.atomic_instructions = {}
        self._ws = None

    def protocol_probe(self):
        endpoint = f'http://{self.remote_path}/status/'
        try:
            response = requests.get(endpoint)
            if response.status_code == 200:
                if response.url.startswith('https://'):
                    self._http_protocol = 'https://'
                    self._ws_protocol = 'wss://'
                return
        except Exception:
            pass

        endpoint = f'https://{self.remote_path}/status/'
        try:
            response = requests.get(endpoint)
            if response.status_code == 200:
                self._http_protocol = 'https://'
                self._ws_protocol = 'wss://'
        except Exception:
            pass

    def reinitialize_resource(self, handler):
        # write some request to get a resource on server side with an already given handler
        resource = self._resource_pool[handler]
        self.get_resource_handler(resource, resource.resource_type, handler, resource.init_args)

    def _reinitialize_all_resources(self):
        handlers_list = list(self._resource_pool.keys())
        for handler in handlers_list:
            self.reinitialize_resource(handler)

    def _check_remote_version_compatibility(self):
        from aim.__version__ import __version__ as client_version

        error_message_template = 'The Aim Remote tracking server version ({}) '\
                                 'is not compatible with the Aim client version ({}).'\
                                 'Please upgrade either the Aim Client or the Aim Remote.'

        warning_message_template = 'The Aim Remote tracking server version ({}) ' \
                                   'and the Aim client version ({}) do not match.' \
                                   'Consider upgrading either the client or remote tracking server.'

        remote_version = self.get_version()

        # server doesn't yet have the `get_version()` method implemented
        if remote_version == '<4.0.0':
            RuntimeError(error_message_template.format(remote_version, client_version))

        # compare versions
        if client_version == remote_version:
            return

        # if the server has a newer version always force to upgrade the client
        if client_version < remote_version:
            raise RuntimeError(error_message_template.format(remote_version, client_version))

        # for other mismatching versions throw a warning for now
        logger.warning(warning_message_template.format(remote_version, client_version))
        # further incompatibility list will be added manually

    def client_heartbeat(self):
        endpoint = f'{self._http_protocol}{self._client_endpoint}/heartbeat/{self.uri}/'
        response = requests.get(endpoint)
        response_json = response.json()
        if response.status_code != 200:
            raise_exception(response_json.get('message'))

        return response

    @handle_exception(requests.ConnectionError,
                      error_message='Failed to connect to Aim Server. Have you forgot to run `aim server` command?')
    def connect(self):
        endpoint = f'{self._http_protocol}{self._client_endpoint}/connect/{self.uri}/'
        response = requests.get(endpoint)
        response_json = response.json()
        if response.status_code != 200:
            raise_exception(response_json.get('message'))

        return response

    def reconnect(self):
        endpoint = f'{self._http_protocol}{self._client_endpoint}/reconnect/{self.uri}/'
        response = requests.get(endpoint)
        response_json = response.json()
        if response.status_code != 200:
            raise_exception(response_json.get('message'))

        self.refresh_ws()
        self._reinitialize_all_resources()

        return response

    def disconnect(self):
        self._heartbeat_sender.stop()

        endpoint = f'{self._http_protocol}{self._client_endpoint}/disconnect/{self.uri}/'
        response = requests.get(endpoint)
        response_json = response.json()
        if response.status_code != 200:
            raise_exception(response_json.get('message'))

        return response

    def get_version(self,):
        endpoint = f'{self._http_protocol}{self._client_endpoint}/get-version/'
        response = requests.get(endpoint)
        response_json = response.json()
        if response.status_code == 404:
            return '<4.0.0'
        if response.status_code == 400:
            raise_exception(response_json.get('exception'))
        return response_json.get('version')

    def get_resource_handler(self, resource, resource_type, handler='', args=()):
        endpoint = f'{self._http_protocol}{self._tracking_endpoint}/{self.uri}/get-resource/'

        request_data = {
            'resource_handler': handler,
            'resource_type': resource_type,
            'args': base64.b64encode(args).decode()
        }

        response = requests.post(endpoint, json=request_data)

        response_json = response.json()
        if response.status_code == 400:
            raise_exception(response_json.get('exception'))
        elif response.status_code != 200:
            raise (Exception(response_json))

        handler = response_json.get('handler')
        self._resource_pool[handler] = resource

        return handler

    def release_resource(self, queue_id, resource_handler):
        endpoint = f'{self._http_protocol}{self._tracking_endpoint}/{self.uri}/release-resource/{resource_handler}/'
        if queue_id != -1:
            self.get_queue().wait_for_finish()

        response = requests.get(endpoint)
        response_json = response.json()
        if response.status_code == 400:
            raise_exception(response_json.get('exception'))

        del self._resource_pool[resource_handler]

    def run_instruction(self, queue_id, resource, method, args=(), is_write_only=False):
        args = deepcopy(args)

        # self._thread_local can be empty in the 'clean up' phase.

        if is_write_only:
            assert queue_id != -1
            if getattr(self._thread_local, 'atomic_instructions', None) is not None and \
                    self._thread_local.atomic_instructions.get(queue_id, None) is not None:
                self._thread_local.atomic_instructions[queue_id].append((resource, method, args))
                return

            self.get_queue().register_task(
                self,
                self._run_write_instructions, list(encode_tree([(resource, method, args)], strict=False)))
            return

        return self._run_read_instructions(queue_id, resource, method, args)

    def _run_read_instructions(self, queue_id, resource, method, args):
        endpoint = f'{self._http_protocol}{self._tracking_endpoint}/{self.uri}/read-instruction/'

        request_data = {
            'resource_handler': resource,
            'method_name': method,
            'args': base64.b64encode(pack_args(encode_tree(args))).decode()
        }

        if queue_id != -1:
            self.get_queue().wait_for_finish()

        response = requests.post(endpoint, json=request_data, stream=True)

        if response.status_code == 400:
            raise_exception(response.json().get('exception'))
        return decode_tree(unpack_stream(response.iter_content(chunk_size=None)))

    def _run_write_instructions(self, instructions: [Tuple[bytes, bytes]]):
        msg = pack_args(iter(instructions))

        self.ws.send(msg)

        response = self.ws.recv()
        if response == b'OK':
            return

        response_json = decode_tree(unpack_args(response))
        raise_exception(response_json)

    def start_instructions_batch(self, hash_):
        if getattr(self._thread_local, 'atomic_instructions', None) is None:
            self._thread_local.atomic_instructions = {}
        self._thread_local.atomic_instructions[hash_] = []

    def flush_instructions_batch(self, hash_):
        if self._thread_local.atomic_instructions.get(hash_) is None:
            return

        self.get_queue().register_task(
            self,
            self._run_write_instructions, list(encode_tree(self._thread_local.atomic_instructions[hash_])))
        del self._thread_local.atomic_instructions[hash_]

    def refresh_ws(self):
        self._ws = connect(f'{self._ws_protocol}{self._tracking_endpoint}/{self.uri}/write-instruction/')

    @property
    def ws(self):
        if self._ws is None:
            self._ws = connect(f'{self._ws_protocol}{self._tracking_endpoint}/{self.uri}/write-instruction/')

        return self._ws

    @property
    def uri(self):
        return self._id

    @property
    def remote_path(self):
        return self._remote_path

    def get_queue(self):
        return self._queue
