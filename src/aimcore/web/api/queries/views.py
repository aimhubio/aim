from fastapi.responses import StreamingResponse
from fastapi import HTTPException

from typing import Optional, Iterable, Dict, List, Iterator, TYPE_CHECKING
from aim._sdk.uri_service import URIService
from aim.utils import sequence_data, container_data

from aimcore.web.api.runs.pydantic_models import QuerySyntaxErrorOut
from aimcore.web.api.utils import (
    checked_query,
    collect_streamable_data,
    get_project_repo,
    APIRouter  # wrapper for fastapi.APIRouter
)

from aim import Container, Sequence

from aim._core.storage.treeutils import encode_tree

query_router = APIRouter()

if TYPE_CHECKING:
    from aim._sdk.repo import Repo


async def sequence_search_result_streamer(repo: 'Repo',
                                          query_collection,
                                          p: Optional[int],
                                          start: Optional[int],
                                          stop: Optional[int],
                                          sample_seed: str):
    for sequence in query_collection:
        seq_data = {hash(sequence): sequence_data(
            repo, sequence, p, start, stop, sample_seed)}
        encoded_tree = encode_tree(seq_data)
        yield collect_streamable_data(encoded_tree)


async def container_search_result_streamer(query_collection: Iterable[Container]):
    for container in query_collection:
        cont_data = {container.hash: container_data(container)}
        encoded_tree = encode_tree(cont_data)
        yield collect_streamable_data(encoded_tree)


def sequence_query_grouped_response(repo: 'Repo',
                                    query_collection,
                                    p: Optional[int],
                                    start: Optional[int],
                                    stop: Optional[int],
                                    sample_seed: str):
    #  TODO: V4 use repo query methods and grouping instead
    containers_data = {}
    for sequence in query_collection:
        seq_data = sequence_data(repo, sequence, p, start, stop, sample_seed)

        cont_hash = sequence._container_hash
        if cont_hash not in containers_data:
            container = repo.get_container(cont_hash)
            cont_data = container_data(container)
            cont_data['sequences'] = []
            containers_data[cont_hash] = cont_data
        containers_data[cont_hash]['sequences'].append(seq_data)

    async def dict_result_streamer(data):
        for k, v in data.items():
            encoded_tree = encode_tree({k: v})
            yield collect_streamable_data(encoded_tree)

    streamer = dict_result_streamer(containers_data)
    return StreamingResponse(streamer)


@query_router.get('/fetch/', responses={400: {'model': QuerySyntaxErrorOut}})
async def data_fetch_api(type_: str,
                         q: Optional[str] = '',
                         p: Optional[int] = 500,
                         start: Optional[int] = None,
                         stop: Optional[int] = None):
    repo = get_project_repo()
    query = checked_query(q)
    if type_ in Container.registry:
        qresult = repo.containers(query, type_)
        streamer = container_search_result_streamer(qresult)
    elif type_ in Sequence.registry:
        qresult = repo.sequences(query, type_)
        sample_seed = f'{query}_{p}_{start}_{stop}'
        streamer = sequence_search_result_streamer(
            repo, qresult, p, start, stop, sample_seed)
    else:
        raise HTTPException(
            status_code=400, detail=f'Unknown type \'{type_}\'.')
    return StreamingResponse(streamer)


@query_router.get('/grouped-sequences/')
async def grouped_data_fetch_api(seq_type: Optional[str] = 'Sequence',
                                 cont_type: Optional[str] = 'Container',
                                 q: Optional[str] = '',
                                 p: Optional[int] = 500,
                                 start: Optional[int] = None,
                                 stop: Optional[int] = None):
    repo = get_project_repo()
    query = checked_query(q)
    if seq_type not in Sequence.registry:
        raise HTTPException(
            status_code=400, detail=f'\'{seq_type}\' is not a valid Sequence type.')
    if cont_type not in Container.registry:
        raise HTTPException(
            status_code=400, detail=f'\'{cont_type}\' is not a valid Container type.')
    if query:
        query = f'(container.type.startswith("{Container.registry[cont_type][0].get_full_typename()}")) and {query}'
    else:
        query = f'container.type.startswith("{Container.registry[cont_type][0].get_full_typename()}")'
    qresult = repo.sequences(query, seq_type)
    sample_seed = f'{query}_{p}_{start}_{stop}'
    return sequence_query_grouped_response(repo, qresult, p, start, stop, sample_seed)


URIBatchIn = List[str]


def fetch_blobs_batch(repo: 'Repo', uri_batch: List[str]) -> Iterator[bytes]:
    uri_service = URIService(repo=repo)
    batch_iterator = uri_service.request_batch(uri_batch=uri_batch)
    for it in batch_iterator:
        yield collect_streamable_data(encode_tree(it))


@query_router.post('/fetch-blobs/')
async def fetch_blobs_api(uri_batch: URIBatchIn):
    repo = get_project_repo()
    return StreamingResponse(fetch_blobs_batch(repo, uri_batch))


@query_router.post('/run/')
async def run_function(func_name: str, request_data: Dict):
    repo = get_project_repo()  # noqa

    from aim._sdk.function import Function
    function = Function.registry[func_name]
    is_generator = function.is_generator
    res = function.execute(**request_data)
    if is_generator:
        def result_streamer():
            for i, it in enumerate(res):
                yield collect_streamable_data(encode_tree({i: it}))
    else:
        def result_streamer():
            yield collect_streamable_data(encode_tree({0: res}))

    return StreamingResponse(result_streamer(), headers={
        'Access-Control-Expose-Headers': 'is-generator', 'Is-Generator': str(is_generator)})
