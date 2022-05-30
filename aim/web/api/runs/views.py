from fastapi import Depends, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse
from starlette import status

from aim.web.api.runs.object_views import (
    ImageApiConfig,
    TextApiConfig,
    DistributionApiConfig,
    AudioApiConfig,
    FigureApiConfig
)
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from typing import Optional, Tuple

from aim.web.api.runs.utils import (
    checked_query,
    collect_requested_metric_traces,
    custom_aligned_metrics_streamer,
    get_project_repo,
    get_run_or_404,
    get_run_props,
    metric_search_result_streamer,
    run_search_result_streamer,
    run_logs_streamer

)
from aim.web.api.runs.pydantic_models import (
    MetricAlignApiIn,
    QuerySyntaxErrorOut,
    RunTracesBatchApiIn,
    RunMetricCustomAlignApiOut,
    RunMetricSearchApiOut,
    RunInfoOut,
    RunsBatchIn,
    RunSearchApiOut,
    RunMetricsBatchApiOut,
    StructuredRunUpdateIn,
    StructuredRunUpdateOut,
    StructuredRunAddTagIn,
    StructuredRunAddTagOut,
    StructuredRunRemoveTagOut,
    StructuredRunsArchivedOut,
    NoteIn,
)
from aim.web.api.utils import object_factory

runs_router = APIRouter()

# static msgs
NOTE_NOT_FOUND = 'Note with id {id} is not found in this run.'


@runs_router.get('/search/run/', response_model=RunSearchApiOut,
                 responses={400: {'model': QuerySyntaxErrorOut}})
def run_search_api(q: Optional[str] = '', limit: Optional[int] = 0, offset: Optional[str] = None):
    repo = get_project_repo()
    query = checked_query(q)

    runs = repo.query_runs(query=query, paginated=bool(limit), offset=offset)

    streamer = run_search_result_streamer(runs, limit)
    return StreamingResponse(streamer)


@runs_router.post('/search/metric/align/', response_model=RunMetricCustomAlignApiOut)
def run_metric_custom_align_api(request_data: MetricAlignApiIn):
    repo = get_project_repo()
    x_axis_metric_name = request_data.align_by
    requested_runs = request_data.runs

    streamer = custom_aligned_metrics_streamer(requested_runs, x_axis_metric_name, repo)
    return StreamingResponse(streamer)


@runs_router.get('/search/metric/', response_model=RunMetricSearchApiOut,
                 responses={400: {'model': QuerySyntaxErrorOut}})
async def run_metric_search_api(q: Optional[str] = '',
                                p: Optional[int] = 50,
                                x_axis: Optional[str] = None):
    steps_num = p

    if x_axis:
        x_axis = x_axis.strip()

    repo = get_project_repo()
    query = checked_query(q)
    traces = repo.query_metrics(query=query)

    streamer = metric_search_result_streamer(traces, steps_num, x_axis)
    return StreamingResponse(streamer)


@runs_router.get('/{run_id}/info/', response_model=RunInfoOut)
async def run_params_api(run_id: str, sequence: Optional[Tuple[str, ...]] = Query(())):
    repo = get_project_repo()
    run = get_run_or_404(run_id, repo=repo)

    if sequence != ():
        try:
            repo.validate_sequence_types(sequence)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        sequence = repo.available_sequence_types()

    response = {
        'params': run.get(..., resolve_objects=True),
        'traces': run.collect_sequence_info(sequence, skip_last_value=True),
        'props': get_run_props(run)
    }

    response['props'].update({
        'notes': len(run.props.notes_obj)
    })
    return JSONResponse(response)


@runs_router.post('/{run_id}/metric/get-batch/', response_model=RunMetricsBatchApiOut)
async def run_metric_batch_api(run_id: str, requested_traces: RunTracesBatchApiIn):
    run = get_run_or_404(run_id)
    traces_data = collect_requested_metric_traces(run, requested_traces)

    return JSONResponse(traces_data)


@runs_router.put('/{run_id}/', response_model=StructuredRunUpdateOut)
async def update_run_properties_api(run_id: str, run_in: StructuredRunUpdateIn, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        if run_in.name:
            run.name = run_in.name.strip()
        if run_in.description:
            run.description = run_in.description.strip()
        if run_in.experiment:
            run.experiment = run_in.experiment.strip()
        run.archived = run_in.archived

    return {
        'id': run.hash,
        'status': 'OK'
    }


@runs_router.post('/{run_id}/tags/new/', response_model=StructuredRunAddTagOut)
async def add_run_tag_api(run_id: str, tag_in: StructuredRunAddTagIn, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        run.add_tag(tag_in.tag_name)
        tag = next(iter(factory.search_tags(tag_in.tag_name)))
    return {
        'id': run.hash,
        'tag_id': tag.uuid,
        'status': 'OK'
    }


@runs_router.delete('/{run_id}/tags/{tag_id}/', response_model=StructuredRunRemoveTagOut)
async def remove_run_tag_api(run_id: str, tag_id: str, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        tag = factory.find_tag(tag_id)
        if not (run or tag):
            raise HTTPException(status_code=404)

        removed = run.remove_tag(tag.name)

    return {
        'id': run.hash,
        'removed': removed,
        'status': 'OK'
    }


@runs_router.delete('/{run_id}/')
async def delete_run_api(run_id: str):
    repo = get_project_repo()
    success = repo.delete_run(run_id)
    if not success:
        raise HTTPException(status_code=400, detail={
            'message': 'Error while deleting run.',
            'detail': {
                'Run id': run_id
            }
        })

    return {
        'id': run_id,
        'status': 'OK'
    }


@runs_router.post('/delete-batch/')
async def delete_runs_batch_api(runs_batch: RunsBatchIn):
    repo = get_project_repo()
    success, remaining_runs = repo.delete_runs(runs_batch)
    if not success:
        raise HTTPException(status_code=400, detail={
            'message': 'Error while deleting runs.',
            'detail': {
                'Remaining runs id': remaining_runs
            }
        })

    return {
        'status': 'OK'
    }


@runs_router.post('/archive-batch/', response_model=StructuredRunsArchivedOut)
async def archive_runs_batch_api(runs_batch: RunsBatchIn, archive: Optional[bool] = True,
                                 factory=Depends(object_factory)):
    with factory:
        runs = factory.find_runs(runs_batch)
        if not runs:
            raise HTTPException(status_code=404)

        for run in runs:
            run.archived = archive

    return {
        'status': 'OK'
    }


# Note APIs

@runs_router.get('/{run_id}/note/')
def list_note_api(run_id, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        notes = run.notes

    return notes


@runs_router.post('/{run_id}/note/', status_code=status.HTTP_201_CREATED)
def create_note_api(run_id, note_in: NoteIn, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        note_content = note_in.content.strip()
        note = run.add_note(note_content)

    return {
        'id': note.id,
        'created_at': note.created_at,
    }


@runs_router.get('/{run_id}/note/{_id}')
def get_note_api(run_id, _id: int, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        note = run.find_note(_id=_id)
        if not note:
            raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND.format(id=_id))

    return {
        'id': note.id,
        'content': note.content,
        'updated_at': note.updated_at,
    }


@runs_router.put('/{run_id}/note/{_id}')
def update_note_api(run_id, _id: int, note_in: NoteIn, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        note = run.find_note(_id=_id)
        if not note:
            raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND.format(id=_id))

        content = note_in.content.strip()
        updated_note = run.update_note(_id=_id, content=content)

    return {
        'id': updated_note.id,
        'content': updated_note.content,
        'updated_at': updated_note.updated_at,
    }


@runs_router.delete('/{run_id}/note/{_id}')
def delete_note_api(run_id, _id: int, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        note = run.find_note(_id=_id)
        if not note:
            raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND.format(id=_id))

        run.remove_note(_id)

    return {
        'status': 'OK'
    }


@runs_router.get('/{run_id}/logs/')
async def get_logs_api(run_id: str, record_range: Optional[str] = ''):
    repo = get_project_repo()
    run = get_run_or_404(run_id, repo=repo)

    return StreamingResponse(run_logs_streamer(run, record_range))


def add_api_routes():
    ImageApiConfig.register_endpoints(runs_router)
    TextApiConfig.register_endpoints(runs_router)
    DistributionApiConfig.register_endpoints(runs_router)
    AudioApiConfig.register_endpoints(runs_router)
    FigureApiConfig.register_endpoints(runs_router)
