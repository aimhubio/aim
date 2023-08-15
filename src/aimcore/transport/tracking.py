import uuid
import base64
import logging

from typing import Dict, Union
from fastapi import WebSocket, Request, APIRouter
from fastapi.responses import StreamingResponse, JSONResponse

import aimcore.transport.message_utils as utils
from aim._core.storage.treeutils import encode_tree, decode_tree

logger = logging.getLogger(__name__)


def get_handler():
    return str(uuid.uuid4())


class ResourceTypeRegistry:
    def __init__(self):
        self._registry: Dict[str, type] = {}

    def register(self, type_name: str, resource_getter: Union[type, callable]):
        self._registry[type_name] = resource_getter

    def __getitem__(self, type_name: str):
        return self._registry[type_name]


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


class TrackingRouter:
    resource_pool = dict()
    manager = ConnectionManager()

    def __init__(self, resource_registry: ResourceTypeRegistry):
        self.registry = resource_registry
        self.router = APIRouter()
        self.router.add_api_route('/{client_uri}/get-resource/',
                                  self.get_resource, methods=['POST'])
        self.router.add_api_route('/{client_uri}/release-resource/{resource_handler}/',
                                  self.release_resource, methods=['GET'])
        self.router.add_api_route('/{client_uri}/read-instruction/', self.run_instruction, methods=['POST'])

    @classmethod
    def cleanup_client_resources(cls, dead_client_uri):
        resource_handlers = list(cls.resource_pool.keys())
        for handler in resource_handlers:
            (client_uri, _) = cls.resource_pool[handler]
            if dead_client_uri == client_uri:
                del cls.resource_pool[handler]

    @classmethod
    def _verify_resource_handler(cls, resource_handler, client_uri):
        res_info = cls.resource_pool.get(resource_handler, None)
        if not res_info or res_info[0] != client_uri:
            raise utils.UnauthorizedRequestError(resource_handler)

    async def get_resource(self,
                           client_uri: str,
                           request: Request,):
        request_data = await request.json()
        resource_handler = request_data.get('resource_handler')
        resource_type = request_data.get('resource_type')
        args = request_data.get('args')

        if not resource_handler:
            resource_handler = get_handler()

        try:
            resource_cls = self.registry[resource_type]
            if len(args) > 0:
                kwargs = decode_tree(utils.unpack_args(base64.b64decode(args)))
                checked_kwargs = {}
                for argname, arg in kwargs.items():
                    if isinstance(arg, utils.ResourceObject):
                        handler = arg.storage['handler']
                        self._verify_resource_handler(handler, client_uri)
                        checked_kwargs[argname] = self.resource_pool[handler][1].ref
                    else:
                        checked_kwargs[argname] = arg

                res = resource_cls(**checked_kwargs)
            else:
                res = resource_cls()

            self.resource_pool[resource_handler] = (client_uri, res)
            return {'handler': resource_handler}

        except Exception as e:
            try:
                # clean up resource_pool
                # because no one will call release_resource in case of Exception
                del self.resource_pool[resource_handler]
            except KeyError:
                pass

            logger.debug(f'Caught exception {e}. Sending response 400.')
            return JSONResponse({
                'exception': utils.build_exception(e),
            }, status_code=400)

    async def release_resource(self, client_uri, resource_handler):
        try:
            self._verify_resource_handler(resource_handler, client_uri)
            del self.resource_pool[resource_handler]
        except Exception as e:
            logger.debug(f'Caught exception {e}. Sending response 400.')
            return JSONResponse({
                'exception': utils.build_exception(e),
            }, status_code=400)

    async def run_instruction(self, client_uri: str,
                              request: Request,):
        try:
            request_data = await request.json()
            resource_handler = request_data.get('resource_handler')
            method_name = request_data.get('method_name')
            args = request_data.get('args')

            self._verify_resource_handler(resource_handler, client_uri)

            args = decode_tree(utils.unpack_args(base64.b64decode(args)))

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
                result = None
            else:
                attr = getattr(resource, method_name)
                if callable(attr):
                    result = attr(*checked_args)
                else:
                    result = attr

            return StreamingResponse(utils.pack_stream(encode_tree(result)))
        except Exception as e:
            logger.debug(f'Caught exception {e}. Sending response 400.')
            return JSONResponse({
                'exception': utils.build_exception(e),
            }, status_code=400)
