from fastapi.responses import StreamingResponse
from fastapi import HTTPException

from typing import Optional, Iterable, Dict, List, Iterator, TYPE_CHECKING
from aim._sdk.uri_service import URIService


from aimcore.web.api.runs.pydantic_models import QuerySyntaxErrorOut
from aimcore.web.api.utils import checked_query, collect_streamable_data, get_project_repo, \
      APIRouter  # wrapper for fastapi.APIRouter

from aim import Container, Sequence

from aim._core.storage.treeutils import encode_tree

query_router = APIRouter()

if TYPE_CHECKING:
    from aim._sdk.repo import Repo


def _process_values(repo: 'Repo', values_list: list) -> list:
    processed_values = []
    for val in values_list:
        if isinstance(val, list):
            processed_val = []
            for nested_val in val:
                try:
                    processed_nested_val = nested_val.dump(repo)
                except AttributeError:
                    processed_nested_val = nested_val
                processed_val.append(processed_nested_val)
        else:
            try:
                processed_val = val.dump(repo)
            except AttributeError:
                processed_val = val
        processed_values.append(processed_val)

    return processed_values


def _sequence_data(repo: 'Repo', sequence: Sequence, sample_count: Optional[int]) -> Dict:
    data = {
        'name': sequence.name,
        'context': sequence.context,
        'item_type': sequence.type,
        'axis_names': sequence.axis_names,
        'axis': {}
    }
    if sample_count is None:
        data['steps'] = list(sequence.steps())
        data['values'] = _process_values(repo, list(sequence.values()))
        for axis_name in sequence.axis_names:
            data['axis'][axis_name] = list(sequence.axis(axis_name))
    else:
        steps, value_dicts = list(zip(*sequence.sample(sample_count)))
        value_lists = {k: [d[k] for d in value_dicts] for k in value_dicts[0]}
        data['steps'] = steps
        data['values'] = _process_values(repo, value_lists.pop('val'))
        data['axis'] = value_lists
    return data


def _container_data(container: Container) -> Dict:
    data = {
        'hash': container.hash,
        'params': container[...]
    }
    return data


async def sequence_search_result_streamer(repo: 'Repo', query_collection, sample_count: Optional[int]):
    for sequence in query_collection:
        seq_data = _sequence_data(repo, sequence, sample_count)
        encoded_tree = encode_tree(seq_data)
        yield collect_streamable_data(encoded_tree)


async def container_search_result_streamer(query_collection: Iterable[Container]):
    for container in query_collection:
        cont_data = _container_data(container)
        encoded_tree = encode_tree(cont_data)
        yield collect_streamable_data(encoded_tree)


def container_query_response(repo, query: Optional[str], type_: str):
    qresult = repo.containers(query, type_)
    streamer = container_search_result_streamer(qresult)
    return StreamingResponse(streamer)


def sequence_query_response(repo, query: Optional[str], type_: str, sample_count: Optional[int]):
    qresult = repo.sequences(query, type_)
    streamer = sequence_search_result_streamer(repo, qresult, sample_count)
    return StreamingResponse(streamer)


def sequence_query_grouped_response(repo: 'Repo', query: Optional[str], type_: str, sample_count: Optional[int]):
    #  TODO: V4 use repo query methods and grouping instead
    qresult = repo.sequences(query, type_)
    containers_data = {}
    for sequence in qresult:
        seq_data = _sequence_data(repo, sequence, sample_count)

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
                         p: Optional[int] = 500):
    repo = get_project_repo()
    query = checked_query(q)
    if type_ in Container.registry:
        return container_query_response(repo, query, type_)
    elif type_ in Sequence.registry:
        return sequence_query_response(repo, query, type_, p)
    raise HTTPException(status_code=400, detail=f'Unknown type \'{type_}\'.')


@query_router.get('/grouped-sequences/')
async def grouped_data_fetch_api(seq_type: Optional[str] = 'Sequence',
                                 cont_type: Optional[str] = 'Container',
                                 q: Optional[str] = '',
                                 p: Optional[int] = 500):
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
    return sequence_query_grouped_response(repo, query, seq_type, p)


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
