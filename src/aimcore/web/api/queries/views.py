import random

from fastapi.responses import StreamingResponse
from fastapi import HTTPException

from typing import Optional, Iterable, Dict, List, Iterator, TYPE_CHECKING
from aim._sdk.uri_service import URIService
from aim._core.storage.encoding import encode_path, decode_path

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


def _process_values(repo: 'Repo', values_list: list, steps_list: list, sequence: Sequence) -> list:
    # TODO V4: Move blobs uri handling to dump
    from aim._sdk.uri_service import URIService
    uri_service = URIService(repo)

    processed_values = []
    for step, val in zip(steps_list, values_list):
        if isinstance(val, list):
            processed_val = []
            for idx in range(len(val)):
                nested_val = val[idx]
                try:
                    processed_nested_val = nested_val.dump()
                    if not nested_val.RESOLVE_BLOBS:
                        khash_view = sequence._data.reservoir().container
                        khash_step = decode_path(khash_view.to_khash(encode_path(step)))
                        additional_path = (*khash_step, 'val', idx, 'data')
                        resource_path = uri_service.generate_resource_path(sequence._data.container, additional_path)
                        processed_nested_val['blobs'] = {'data': uri_service.generate_uri(resource_path)}
                except AttributeError:
                    processed_nested_val = nested_val
                processed_val.append(processed_nested_val)
        else:
            try:
                processed_val = val.dump()
                if not val.RESOLVE_BLOBS:
                    khash_view = sequence._data.reservoir().container
                    khash_step = decode_path(khash_view.to_khash(encode_path(step)))
                    additional_path = (*khash_step, 'val', 'data')
                    resource_path = uri_service.generate_resource_path(sequence._data.container, additional_path)
                    processed_val['blobs'] = {'data': uri_service.generate_uri(resource_path)}
            except AttributeError:
                processed_val = val
        processed_values.append(processed_val)

    return processed_values


def _sequence_data(repo: 'Repo',
                   sequence: Sequence,
                   p: Optional[int],
                   start: Optional[int],
                   stop: Optional[int],
                   sample_seed: str) -> Dict:
    data = {
        'name': sequence.name,
        'context': sequence.context,
        'container': {
            'hash': sequence._container_hash
        },
        'sequence_type': sequence.get_typename(),
        'sequence_full_type': sequence.get_full_typename(),
        'item_type': sequence.type,
        'axis_names': sequence.axis_names,
        'range': (sequence.start, sequence.stop),
        'axis': {},
        'steps': [],
        'values': [],
    }
    if p is None and start is None and stop is None:
        steps_list = list(sequence.steps())
        data['steps'] = steps_list
        data['values'] = _process_values(repo, list(sequence.values()), steps_list, sequence)
        for axis_name in sequence.axis_names:
            data['axis'][axis_name] = list(sequence.axis(axis_name))
    else:
        random.seed(sample_seed)  # use the query API qparams as sample seed
        try:
            steps, value_dicts = list(zip(*sequence[start:stop].sample(p)))
            value_lists = {k: [d[k] for d in value_dicts] for k in value_dicts[0]}
            data['steps'] = steps
            data['values'] = _process_values(repo, value_lists.pop('val'), steps, sequence)
            data['axis'] = value_lists
        except Exception:
            pass

    return data


def _container_data(container: Container) -> Dict:
    data = {
        'hash': container.hash,
        'params': container[...],
        'container_type': container.get_typename(),
        'container_full_type': container.get_full_typename(),
    }
    return data


async def sequence_search_result_streamer(repo: 'Repo',
                                          query_collection,
                                          p: Optional[int],
                                          start: Optional[int],
                                          stop: Optional[int],
                                          sample_seed: str):
    for sequence in query_collection:
        seq_data = {hash(sequence): _sequence_data(repo, sequence, p, start, stop, sample_seed)}
        encoded_tree = encode_tree(seq_data)
        yield collect_streamable_data(encoded_tree)


async def container_search_result_streamer(query_collection: Iterable[Container]):
    for container in query_collection:
        cont_data = {container.hash: _container_data(container)}
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
        seq_data = _sequence_data(repo, sequence, p, start, stop, sample_seed)

        cont_hash = sequence._container_hash
        if cont_hash not in containers_data:
            container = repo.get_container(cont_hash)
            cont_data = _container_data(container)
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
        streamer = sequence_search_result_streamer(repo, qresult, p, start, stop, sample_seed)
    else:
        raise HTTPException(status_code=400, detail=f'Unknown type \'{type_}\'.')
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
        raise HTTPException(status_code=400, detail=f'\'{seq_type}\' is not a valid Sequence type.')
    if cont_type not in Container.registry:
        raise HTTPException(status_code=400, detail=f'\'{cont_type}\' is not a valid Container type.')
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


@query_router.get('/fetch-blobs/')
async def fetch_blobs_api(uri_batch: URIBatchIn):
    repo = get_project_repo()
    return StreamingResponse(fetch_blobs_batch(repo, uri_batch))
