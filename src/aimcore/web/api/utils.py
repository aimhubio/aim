import struct
from collections import namedtuple
from itertools import chain

from fastapi import APIRouter as FastAPIRouter
from fastapi import HTTPException
from fastapi.types import DecoratedCallable

from typing import Any, Callable, Iterator, Tuple, List

from aim._core.storage.treeutils import encode_tree
from aim._sdk.query import syntax_error_check
from aim._sdk.uri_service import URIService
from aimcore.web.api.projects.project import Project

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from aim import Repo


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


def collect_streamable_data(encoded_tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    result = [struct.pack('I', len(key)) + key + struct.pack('I', len(val)) + val for key, val in encoded_tree]
    return b''.join(result)


def get_project() -> Project:
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    return project


def get_project_repo() -> 'Repo':
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


def get_blobs_batch(uri_batch: List[str], repo: 'Repo') -> Iterator[bytes]:
    uri_service = URIService(repo=repo)
    batch_iterator = uri_service.request_batch(uri_batch=uri_batch)
    for it in batch_iterator:
        yield collect_streamable_data(encode_tree(it))
