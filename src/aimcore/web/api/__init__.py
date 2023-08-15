import os

from fastapi import FastAPI
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from aim._sdk.configs import get_aim_repo_name

from aimcore.web.configs import AIM_PROFILER_KEY
from aimcore.web.middlewares.profiler import PyInstrumentProfilerMiddleware
from aimcore.web.utils import get_root_path


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

    from aimcore.web.api.dashboard_apps.views import dashboard_apps_router
    from aimcore.web.api.dashboards.views import dashboards_router
    from aimcore.web.api.projects.views import projects_router
    from aimcore.web.api.boards.views import boards_router
    from aimcore.web.api.reports.views import reports_router
    from aimcore.web.api.queries.views import query_router
    from aimcore.web.api.views import statics_router
    from aimcore.web.configs import AIM_UI_BASE_PATH

    from aimcore.web.api.projects.project import Project

    # The indexing thread has to run in the same process as the uvicorn app itself.
    # This allows sharing state of indexing using memory instead of process synchronization methods.

    api_app = FastAPI()
    api_app.add_middleware(GZipMiddleware, compresslevel=1)
    api_app.add_exception_handler(HTTPException, http_exception_handler)
    api_app.add_exception_handler(Exception, fallback_exception_handler)

    if os.environ.get(AIM_PROFILER_KEY) == "1":
        api_app.add_middleware(PyInstrumentProfilerMiddleware,
                               repo_path=os.path.join(get_root_path(), get_aim_repo_name()))

    api_app.include_router(dashboard_apps_router, prefix='/apps')
    api_app.include_router(dashboards_router, prefix='/dashboards')
    api_app.include_router(boards_router, prefix='/boards')
    api_app.include_router(reports_router, prefix='/reports')
    api_app.include_router(projects_router, prefix='/projects')
    api_app.include_router(query_router, prefix='/data')

    base_path = os.environ.get(AIM_UI_BASE_PATH, '')

    app.mount(f'{base_path}/api', api_app)
    static_files_app = FastAPI()

    static_files_app.include_router(statics_router)
    app.mount(f'{base_path}/', static_files_app)

    return app
