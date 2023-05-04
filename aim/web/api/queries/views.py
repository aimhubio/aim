from fastapi.responses import StreamingResponse

from typing import Optional, Iterable

from aim.web.api.runs.pydantic_models import QuerySyntaxErrorOut
from aim.web.api.runs.utils import get_project_repo, checked_query, collect_streamable_data
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from aim.web.api.runs.views import runs_search_fn, metrics_search_fn
from aim.web.api.runs.object_views import (
    ImageApiConfig,
    TextApiConfig,
    AudioApiConfig,
    DistributionApiConfig,
    FigureApiConfig)

from aim.sdk.core.container import Container
from aim.sdk.core.sequence import Sequence
from aim.storage.treeutils import encode_tree

query_router = APIRouter()

_legacy_object_types = {
    'Run': runs_search_fn,
    'Metric': metrics_search_fn,
    'Images': ImageApiConfig.sequence_search_fn,
    'Texts': TextApiConfig.sequence_search_fn,
    'Audios': AudioApiConfig.sequence_search_fn,
    'Distributions': DistributionApiConfig.sequence_search_fn,
    'Figures': FigureApiConfig.sequence_search_fn
}


async def sequence_search_result_streamer(query_collection):
    for sequence in query_collection:
        seq_dict = {
            'name': sequence.name,
            'context': sequence.context,
            'item_type': sequence.item_type,
            'axis_names': sequence.axis_names,
            'steps': list(sequence.steps()),
            'values': list(sequence.values())
        }
        encoded_tree = encode_tree(seq_dict)
        yield collect_streamable_data(encoded_tree)


async def container_search_result_streamer(query_collection: Iterable[Container]):
    for container in query_collection:
        cont_dict = {
            'hash': container.hash,
            'params': container[...]
        }
        encoded_tree = encode_tree(cont_dict)
        yield collect_streamable_data(encoded_tree)


def container_query_response(repo, query: str, type_: str):
    qresult = repo.containers(query, type_)
    streamer = container_search_result_streamer(qresult)
    return StreamingResponse(streamer)


def sequence_query_response(repo, query: str, type_: str):
    qresult = repo.sequences(query, type_)
    streamer = sequence_search_result_streamer(qresult)
    return StreamingResponse(streamer)


@query_router.get('/fetch/', responses={400: {'model': QuerySyntaxErrorOut}})
def search_api(type_: str, q: Optional[str]):
    repo = get_project_repo()
    query = checked_query(q)
    if type_ in _legacy_object_types:
        endpoint_fn = _legacy_object_types[type_]
        return endpoint_fn(repo, query)
    elif type_ in Container.registry:
        return container_query_response(repo, query, type_)
    elif type_ in Sequence.registry:
        return sequence_query_response(repo, query, type_)
