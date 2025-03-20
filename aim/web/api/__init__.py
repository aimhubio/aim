import os

from aim.ext.utils import fallback_exception_handler, http_exception_handler
from aim.sdk.configs import get_aim_repo_name
from aim.web.configs import AIM_PROFILER_KEY
from aim.web.middlewares.profiler import PyInstrumentProfilerMiddleware
from aim.web.utils import get_root_path
from fastapi import FastAPI
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware


def create_app():
    app = FastAPI(title=__name__)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        allow_headers=['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Timezone-Offset'],
        allow_credentials=True,
        max_age=86400,
    )

    from aim.web.api.dashboard_apps.views import dashboard_apps_router
    from aim.web.api.dashboards.views import dashboards_router
    from aim.web.api.experiments.views import experiment_router
    from aim.web.api.projects.project import Project
    from aim.web.api.projects.views import projects_router
    from aim.web.api.reports.views import reports_router
    from aim.web.api.runs.views import add_api_routes, runs_router
    from aim.web.api.tags.views import tags_router
    from aim.web.api.utils import ResourceCleanupMiddleware
    from aim.web.api.views import statics_router
    from aim.web.configs import AIM_UI_BASE_PATH

    api_app = FastAPI()
    api_app.add_middleware(GZipMiddleware, compresslevel=1)
    api_app.add_middleware(ResourceCleanupMiddleware)
    api_app.add_exception_handler(HTTPException, http_exception_handler)
    api_app.add_exception_handler(Exception, fallback_exception_handler)

    if os.environ.get(AIM_PROFILER_KEY) == '1':
        api_app.add_middleware(
            PyInstrumentProfilerMiddleware, repo_path=os.path.join(get_root_path(), get_aim_repo_name())
        )

    add_api_routes()

    api_app.include_router(dashboard_apps_router, prefix='/apps')
    api_app.include_router(dashboards_router, prefix='/dashboards')
    api_app.include_router(experiment_router, prefix='/experiments')
    api_app.include_router(projects_router, prefix='/projects')
    api_app.include_router(runs_router, prefix='/runs')
    api_app.include_router(tags_router, prefix='/tags')
    api_app.include_router(reports_router, prefix='/reports')

    base_path = os.environ.get(AIM_UI_BASE_PATH, '')

    app.mount(f'{base_path}/api', api_app)
    static_files_app = FastAPI()

    static_files_app.include_router(statics_router)
    app.mount(f'{base_path}/', static_files_app)

    return app
