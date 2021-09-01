import datetime
import pytz

from fastapi import APIRouter as FastAPIRouter
from fastapi import HTTPException
from fastapi.types import DecoratedCallable
from typing import Any, Callable


def object_factory():
    from aim.web.api.projects.project import Project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    return project.repo.structured_db


def datetime_now():
    return datetime.datetime.utcnow().replace(tzinfo=pytz.utc)


class APIRouter(FastAPIRouter):
    def api_route(
        self, path: str, *, include_in_schema: bool = True, **kwargs: Any
    ) -> Callable[[DecoratedCallable], DecoratedCallable]:
        if path.endswith("/"):
            path = path[:-1]

        add_path = super().api_route(
            path, include_in_schema=include_in_schema, **kwargs
        )

        alternate_path = path + "/"
        add_alternate_path = super().api_route(
            alternate_path, include_in_schema=False, **kwargs
        )

        def decorator(func: DecoratedCallable) -> DecoratedCallable:
            add_alternate_path(func)
            return add_path(func)

        return decorator
