import datetime
import os

from functools import wraps
from typing import Any, Callable

import pytz

from aim.web.configs import AIM_READ_ONLY_UI
from fastapi import APIRouter as FastAPIRouter
from fastapi import HTTPException
from fastapi.types import DecoratedCallable
from starlette.types import ASGIApp, Receive, Scope, Send


def object_factory():
    from aim.web.api.projects.project import Project

    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    return project.repo.structured_db


def datetime_now():
    return datetime.datetime.utcnow().replace(tzinfo=pytz.utc)


def check_read_only(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        if os.environ.get(AIM_READ_ONLY_UI):
            raise HTTPException(status_code=403)
        return await func(*args, **kwargs)

    return wrapper


class APIRouter(FastAPIRouter):
    def api_route(
        self, path: str, *, include_in_schema: bool = True, **kwargs: Any
    ) -> Callable[[DecoratedCallable], DecoratedCallable]:
        if path.endswith('/'):
            path = path[:-1]

        add_path = super().api_route(path, include_in_schema=include_in_schema, **kwargs)

        alternate_path = path + '/'
        add_alternate_path = super().api_route(alternate_path, include_in_schema=False, **kwargs)

        def decorator(func: DecoratedCallable) -> DecoratedCallable:
            add_alternate_path(func)
            return add_path(func)

        return decorator


class ResourceCleanupMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        from aim.web.api.projects.project import Project

        await self.app(scope, receive, send)

        # cleanup repo pools after each api call
        project = Project()
        project.cleanup_repo_pools()
        project.cleanup_sql_caches()
