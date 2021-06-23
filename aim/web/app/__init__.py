from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from aim.engine.types import Singleton
from aim.web.app.config import config


class App(metaclass=Singleton):
    api = None
    executables_manager = None

    @classmethod
    def __init__(cls):
        api = FastAPI(title=__name__)
        api.add_middleware(
            CORSMiddleware,
            allow_origins=['*'],
            allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
            allow_headers=['Origin', 'X-Requested-With',
                           'Content-Type', 'Accept', 'Authorization'],
            allow_credentials=True,
            max_age=86400
        )
        from aim.web.app.commits.views import commits_router
        from aim.web.app.dashboard_apps.views import dashboard_apps_router
        from aim.web.app.dashboards.views import dashboards_router
        from aim.web.app.projects.views import projects_router
        from aim.web.app.tags.views import tags_router
        from aim.web.app.views import general_router
        api.include_router(commits_router, prefix='/api/v1/commits')
        api.include_router(dashboard_apps_router, prefix='/api/v1/apps')
        api.include_router(dashboards_router, prefix='/api/v1/dashboards')
        api.include_router(projects_router, prefix='/api/v1/projects')
        api.include_router(tags_router, prefix='/api/v1/tags')
        api.include_router(general_router)

        cls.api = api
