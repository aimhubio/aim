from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware


def create_app():
    app = FastAPI(title=__name__)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        allow_headers=['Origin', 'X-Requested-With',
                       'Content-Type', 'Accept', 'Authorization'],
        allow_credentials=True,
        max_age=86400
    )

    from aim.web.api.runs.views import runs_router
    from aim.web.api.tags.views import tags_router
    from aim.web.api.experiments.views import experiment_router
    from aim.web.api.dashboard_apps.views import dashboard_apps_router
    from aim.web.api.dashboards.views import dashboards_router
    from aim.web.api.projects.views import projects_router
    from aim.web.api.views import statics_router

    api_app = FastAPI()
    api_app.add_middleware(GZipMiddleware)

    api_app.include_router(dashboard_apps_router, prefix='/apps')
    api_app.include_router(dashboards_router, prefix='/dashboards')
    api_app.include_router(experiment_router, prefix='/experiments')
    api_app.include_router(projects_router, prefix='/projects')
    api_app.include_router(runs_router, prefix='/runs')
    api_app.include_router(tags_router, prefix='/tags')
    app.mount('/api', api_app)

    static_files_app = FastAPI()

    static_files_app.include_router(statics_router)
    app.mount('/', static_files_app)

    return app
