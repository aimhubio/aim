import os

from fastapi import FastAPI

from aim.engine.types import Singleton
from aim.web.app.config import config


class App(metaclass=Singleton):
    api = None
    executables_manager = None

    @classmethod
    def __init__(cls):
        api = FastAPI(title=__name__)
        from aim import web
        # set root path to be reused in views and etc.
        api.root_path = os.path.dirname(web.__file__)

        from aim.web.app.views import general_router
        from aim.web.app.projects.views import projects_router
        from aim.web.app.commits.views import commits_router
        # api
        api.include_router(projects_router, prefix='/api/v1/projects')
        api.include_router(commits_router, prefix='/api/v1/commits')
        # static files
        api.include_router(general_router)

        cls.api = api
