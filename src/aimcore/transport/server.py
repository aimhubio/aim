import os

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import aimcore.transport.message_utils as utils
from aimcore.transport.router import ClientRouter
from aimcore.transport.tracking import TrackingRouter, ResourceTypeRegistry
from aimcore.transport.heartbeat import HeartbeatWatcher
from aimcore.transport.handlers import (
    get_tree,
    get_khash_array,
    get_lock,
    get_file_manager,
    get_dev_package,
    get_repo
)
from aimcore.transport.config import AIM_SERVER_BASE_PATH
from aim._core.storage.treeutils import encode_tree, decode_tree


def prepare_resource_registry():
    registry = ResourceTypeRegistry()
    registry.register('TreeView', get_tree)
    registry.register('KhashArrayView', get_khash_array)
    registry.register('Lock', get_lock)
    registry.register('FileManager', get_file_manager)
    registry.register('Package', get_dev_package)
    registry.register('Repo', get_repo)
    return registry


async def http_exception_handler(request, exc):
    message = str(exc.detail)
    detail = None

    if isinstance(exc.detail, dict):
        message = exc.detail.pop('message', message)
        detail = exc.detail.pop('detail', None)

    response = {'message': message}
    if detail:
        response.update({'detail': detail})
    else:
        response.update({'detail': str(exc)})
    return JSONResponse(response, status_code=exc.status_code)


async def fallback_exception_handler(request, exc):
    response = {
        'message': f'\'{type(exc)}\' exception raised!',
        'detail': str(exc)
    }
    return JSONResponse(response, status_code=500)


def create_app():
    app = FastAPI(title=__name__)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        allow_headers=['Origin', 'X-Requested-With',
                       'Content-Type', 'Accept', 'Authorization', 'X-Timezone-Offset'],
        allow_credentials=True,
        max_age=86400
    )

    registry = prepare_resource_registry()

    client_router = ClientRouter()
    tracking_router = TrackingRouter(registry)

    api_app = FastAPI()

    api_app.include_router(client_router.router, prefix='/client')
    api_app.include_router(tracking_router.router, prefix='/tracking')
    api_app.add_exception_handler(HTTPException, http_exception_handler)
    api_app.add_exception_handler(Exception, fallback_exception_handler)

    base_path = os.environ.get(AIM_SERVER_BASE_PATH, '')
    app.mount(f'{base_path}/', api_app)

    heartbeat_watcher = HeartbeatWatcher(
        ClientRouter.client_heartbeat_pool,
    )
    heartbeat_watcher.start()

    @api_app.get('/status/')
    async def status():
        return {'status': 'OK'}

    @api_app.websocket('/tracking/{client_uri}/write-instruction/')
    async def run_write_instructions(websocket: WebSocket, client_uri: str):
        await TrackingRouter.manager.connect(websocket)

        try:
            while True:
                raw_message = await websocket.receive_bytes()
                write_instructions = decode_tree(
                    utils.unpack_args(raw_message))
                for instruction in write_instructions:
                    resource_handler, method_name, args = instruction
                    TrackingRouter._verify_resource_handler(
                        resource_handler, client_uri)
                    checked_args = []
                    for arg in args:
                        if isinstance(arg, utils.ResourceObject):
                            handler = arg.storage['handler']
                            TrackingRouter._verify_resource_handler(
                                handler, client_uri)
                            checked_args.append(
                                TrackingRouter.resource_pool[handler][1].ref)
                        else:
                            checked_args.append(arg)

                    resource = TrackingRouter.resource_pool[resource_handler][1].ref
                    if method_name.endswith('.setter'):
                        attr_name = method_name.split('.')[0]
                        setattr(resource, attr_name, checked_args[0])
                    else:
                        attr = getattr(resource, method_name)
                        assert callable(attr)
                        attr(*checked_args)

                await websocket.send_bytes(b'OK')
        except WebSocketDisconnect:
            TrackingRouter.manager.disconnect(websocket)

        except Exception as e:
            await websocket.send_bytes(utils.pack_args(encode_tree(utils.build_exception(e))))

    return app


app = create_app()
