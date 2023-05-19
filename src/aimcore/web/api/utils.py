import datetime
import struct
from collections import namedtuple
from itertools import chain

import pytz

from fastapi import APIRouter as FastAPIRouter, HTTPException
from fastapi import HTTPException
from fastapi.types import DecoratedCallable
from starlette.types import ASGIApp, Receive, Scope, Send

from typing import Any, Callable, Iterator, Tuple

from aim.sdk.query import syntax_error_check
from aimcore.web.api.projects.project import Project


def object_factory():
    from aimcore.web.api.projects.project import Project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    return project.repo.structured_db


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


class ResourceCleanupMiddleware:
    def __init__(
        self, app: ASGIApp
    ) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        from aimcore.web.api.projects.project import Project
        await self.app(scope, receive, send)

        # cleanup repo pools after each api call
        project = Project()
        project.cleanup_repo_pools()


def collect_streamable_data(encoded_tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    result = [struct.pack('I', len(key)) + key + struct.pack('I', len(val)) + val for key, val in encoded_tree]
    return b''.join(result)


def get_project():
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    return project


def get_project_repo():
    project = get_project()
    return project.repo


def checked_query(q: str):
    query = q.strip()
    try:
        syntax_error_check(query)
    except SyntaxError as se:
        raise HTTPException(status_code=400, detail={
            'message': 'SyntaxError',
            'detail': {
                'statement': se.text,
                'line': se.lineno,
                'offset': se.offset,
                'end_offset': getattr(se, 'end_offset', 0)
            }
        })
    return query


def checked_range(range_: str = ''):
    try:
        range_ = str_to_range(range_)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid range format')
    return range_


def str_to_range(range_str: str):
    defaults = [None, None]
    slice_values = chain(range_str.strip().split(':'), defaults)

    start, stop, step, *_ = map(lambda x: int(x) if x else None, slice_values)
    return IndexRange(start, stop)


IndexRange = namedtuple('IndexRange', ['start', 'stop'])