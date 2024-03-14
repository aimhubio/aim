import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException

from aim.ext.utils import http_exception_handler, fallback_exception_handler
from aim.ext.transport.router import ClientRouter
from aim.ext.transport.tracking import TrackingRouter, ResourceTypeRegistry
from aim.ext.transport.heartbeat import HeartbeatWatcher
from aim.ext.transport.handlers import (
    get_tree,
    get_structured_run,
    get_repo,
    get_lock,
    get_run_heartbeat,
    get_file_manager
)
from aim.ext.transport.config import AIM_SERVER_BASE_PATH


def prepare_resource_registry():
    registry = ResourceTypeRegistry()
    registry.register('TreeView', get_tree)
    registry.register('StructuredRun', get_structured_run)
    registry.register('Repo', get_repo)
    registry.register('Lock', get_lock)
    registry.register('RunHeartbeat', get_run_heartbeat)
    registry.register('FileManager', get_file_manager)
    return registry


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

    watcher = HeartbeatWatcher(
        ClientRouter.client_heartbeat_pool,
    )
    watcher.start()

    api_app = FastAPI()

    api_app.add_exception_handler(HTTPException, http_exception_handler)
    api_app.add_exception_handler(Exception, fallback_exception_handler)

    api_app.include_router(client_router.router, prefix='/client')
    api_app.include_router(tracking_router.router, prefix='/tracking')

    base_path = os.environ.get(AIM_SERVER_BASE_PATH, '')
    app.mount(f'{base_path}/', api_app)

    @api_app.get('/status', include_in_schema=False)
    @api_app.get('/status/')
    async def status():
        return {'status': 'OK'}

    return app
