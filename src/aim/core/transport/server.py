from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse

from aim.core.transport.router import ClientRouter
from aim.core.transport.tracking import TrackingRouter, ResourceTypeRegistry
from aim.core.transport.heartbeat import HeartbeatWatcher

from fastapi import WebSocket, WebSocketDisconnect

import aim.core.transport.message_utils as utils
from aim.core.storage.treeutils import encode_tree, decode_tree

from aim.core.transport.handlers import (
    get_tree,
    get_khash_array,
    get_structured_run,
    get_repo,
    get_lock,
    get_run_heartbeat,
    get_file_manager
)


def prepare_resource_registry():
    registry = ResourceTypeRegistry()
    registry.register('TreeView', get_tree)
    registry.register('KhashArrayView', get_khash_array)
    registry.register('StructuredRun', get_structured_run)
    registry.register('Repo', get_repo)
    registry.register('Lock', get_lock)
    registry.register('RunHeartbeat', get_run_heartbeat)
    registry.register('FileManager', get_file_manager)
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

app.include_router(client_router.router, prefix='/client')
app.include_router(tracking_router.router, prefix='/tracking')
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, fallback_exception_handler)

heartbeat_watcher = HeartbeatWatcher(
    ClientRouter.client_heartbeat_pool,
)
heartbeat_watcher.start()


@app.websocket('/tracking/{client_uri}/write-instruction/')
async def run_write_instructions(websocket: WebSocket, client_uri: str):
    await TrackingRouter.manager.connect(websocket)

    try:
        while True:
            raw_message = await websocket.receive_bytes()
            write_instructions = decode_tree(utils.unpack_args(raw_message))
            for instruction in write_instructions:
                resource_handler, method_name, args = instruction
                TrackingRouter._verify_resource_handler(resource_handler, client_uri)
                checked_args = []
                for arg in args:
                    if isinstance(arg, utils.ResourceObject):
                        handler = arg.storage['handler']
                        TrackingRouter._verify_resource_handler(handler, client_uri)
                        checked_args.append(TrackingRouter.resource_pool[handler][1].ref)
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


def start_server(host, port, ssl_keyfile=None, ssl_certfile=None, log_level='info'):
    import uvicorn
    uvicorn.run(app, host=host, port=port,
                ssl_keyfile=ssl_keyfile, ssl_certfile=ssl_certfile,
                log_level=log_level)
