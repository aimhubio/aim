from typing import Optional, Tuple

from aim.sdk.types import QueryReportMode
from aim.web.api.runs.object_views import (
    AudioApiConfig,
    DistributionApiConfig,
    FigureApiConfig,
    ImageApiConfig,
    TextApiConfig,
)
from aim.web.api.runs.pydantic_models import (
    MetricAlignApiIn,
    NoteIn,
    QuerySyntaxErrorOut,
    RunActiveOut,
    RunInfoOut,
    RunMetricCustomAlignApiOut,
    RunMetricsBatchApiOut,
    RunMetricSearchApiOut,
    RunsBatchIn,
    RunSearchApiOut,
    RunTracesBatchApiIn,
    StructuredRunAddTagIn,
    StructuredRunAddTagOut,
    StructuredRunRemoveTagOut,
    StructuredRunsArchivedOut,
    StructuredRunUpdateIn,
    StructuredRunUpdateOut,
)
from aim.web.api.runs.utils import (
    checked_query,
    collect_requested_metric_traces,
    convert_nan_and_inf_to_str,
    custom_aligned_metrics_streamer,
    get_project_repo,
    get_run_artifacts,
    get_run_or_404,
    get_run_params,
    get_run_props,
    metric_search_result_streamer,
    run_active_result_streamer,
    run_log_records_streamer,
    run_logs_streamer,
    run_search_result_streamer,
)
from aim.web.api.utils import (
    APIRouter,  # wrapper for fastapi.APIRouter
    check_read_only,
    object_factory,
)
from fastapi import Depends, Header, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse
from starlette import status


runs_router = APIRouter()

# static msgs
NOTE_NOT_FOUND = 'Note with id {id} is not found in this run.'


@runs_router.get('/search/run/', response_model=RunSearchApiOut, responses={400: {'model': QuerySyntaxErrorOut}})
async def run_search_api(
    q: Optional[str] = '',
    limit: Optional[int] = 0,
    offset: Optional[str] = None,
    skip_system: Optional[bool] = True,
    report_progress: Optional[bool] = True,
    exclude_params: Optional[bool] = False,
    exclude_traces: Optional[bool] = False,
    x_timezone_offset: int = Header(default=0),
):
    from aim.sdk.sequence_collection import QueryRunSequenceCollection

    repo = get_project_repo()
    query = checked_query(q)

    repo._prepare_runs_cache()
    runs = QueryRunSequenceCollection(
        repo=repo,
        query=query,
        paginated=bool(limit),
        offset=offset,
        report_mode=QueryReportMode.PROGRESS_TUPLE,
        timezone_offset=x_timezone_offset,
    )

    streamer = run_search_result_streamer(runs, limit, skip_system, report_progress, exclude_params, exclude_traces)
    return StreamingResponse(streamer)


@runs_router.post('/search/metric/align/', response_model=RunMetricCustomAlignApiOut)
async def run_metric_custom_align_api(request_data: MetricAlignApiIn):
    repo = get_project_repo()
    x_axis_metric_name = request_data.align_by
    requested_runs = request_data.runs

    streamer = custom_aligned_metrics_streamer(requested_runs, x_axis_metric_name, repo)
    return StreamingResponse(streamer)


@runs_router.get(
    '/search/metric/', response_model=RunMetricSearchApiOut, responses={400: {'model': QuerySyntaxErrorOut}}
)
async def run_metric_search_api(
    q: Optional[str] = '',
    p: Optional[int] = 50,
    x_axis: Optional[str] = None,
    skip_system: Optional[bool] = True,
    report_progress: Optional[bool] = True,
    x_timezone_offset: int = Header(default=0),
):
    from aim.sdk.sequence_collection import QuerySequenceCollection
    from aim.sdk.sequences.metric import Metric

    steps_num = p

    if x_axis:
        x_axis = x_axis.strip()

    repo = get_project_repo()
    query = checked_query(q)

    repo._prepare_runs_cache()
    traces = QuerySequenceCollection(
        repo=repo,
        seq_cls=Metric,
        query=query,
        report_mode=QueryReportMode.PROGRESS_TUPLE,
        timezone_offset=x_timezone_offset,
    )

    streamer = metric_search_result_streamer(traces, skip_system, steps_num, x_axis, report_progress)
    return StreamingResponse(streamer)


@runs_router.get('/active/', response_model=RunActiveOut)
async def get_active_runs_api(report_progress: Optional[bool] = True):
    repo = get_project_repo()
    repo._prepare_runs_cache()

    streamer = run_active_result_streamer(repo)

    return StreamingResponse(streamer)


@runs_router.get('/{run_id}/info/', response_model=RunInfoOut)
async def run_params_api(
    run_id: str, skip_system: Optional[bool] = False, sequence: Optional[Tuple[str, ...]] = Query(())
):
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
        'params': get_run_params(run, skip_system=skip_system),
        'traces': run.collect_sequence_info(sequence, skip_last_value=True),
        'props': get_run_props(run),
        'artifacts': get_run_artifacts(run),
    }
    # Convert NaN and Inf to strings
    response = convert_nan_and_inf_to_str(response)

    response['props'].update({'notes': len(run.props.notes_obj)})
    return response


@runs_router.post('/{run_id}/metric/get-batch/', response_model=RunMetricsBatchApiOut)
async def run_metric_batch_api(run_id: str, requested_traces: RunTracesBatchApiIn):
    run = get_run_or_404(run_id)
    traces_data = collect_requested_metric_traces(run, requested_traces)

    return JSONResponse(traces_data)


@runs_router.put('/{run_id}/', response_model=StructuredRunUpdateOut)
@check_read_only
async def update_run_properties_api(run_id: str, run_in: StructuredRunUpdateIn, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        if run_in.name is not None:
            run.name = run_in.name.strip()
        if run_in.description is not None:
            run.description = run_in.description.strip()
        if run_in.experiment is not None:
            run.experiment = run_in.experiment.strip()
        run.archived = run_in.archived

    return {'id': run.hash, 'status': 'OK'}


@runs_router.post('/{run_id}/tags/new/', response_model=StructuredRunAddTagOut)
async def add_run_tag_api(run_id: str, tag_in: StructuredRunAddTagIn, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        run.add_tag(tag_in.tag_name)
        tag = next(iter(factory.search_tags(tag_in.tag_name)))
    return {'id': run.hash, 'tag_id': tag.uuid, 'status': 'OK'}


@runs_router.delete('/{run_id}/tags/{tag_id}/', response_model=StructuredRunRemoveTagOut)
async def remove_run_tag_api(run_id: str, tag_id: str, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        tag = factory.find_tag(tag_id)
        if not (run or tag):
            raise HTTPException(status_code=404)

        removed = run.remove_tag(tag.name)

    return {'id': run.hash, 'removed': removed, 'status': 'OK'}


@runs_router.delete('/{run_id}/')
@check_read_only
async def delete_run_api(run_id: str):
    repo = get_project_repo()
    success = repo.delete_run(run_id)
    if not success:
        raise HTTPException(
            status_code=400, detail={'message': 'Error while deleting run.', 'detail': {'Run id': run_id}}
        )

    return {'id': run_id, 'status': 'OK'}


@runs_router.post('/delete-batch/')
@check_read_only
async def delete_runs_batch_api(runs_batch: RunsBatchIn):
    repo = get_project_repo()
    success, remaining_runs = repo.delete_runs(runs_batch)
    if not success:
        raise HTTPException(
            status_code=400,
            detail={'message': 'Error while deleting runs.', 'detail': {'Remaining runs id': remaining_runs}},
        )

    return {'status': 'OK'}


@runs_router.post('/archive-batch/', response_model=StructuredRunsArchivedOut)
@check_read_only
async def archive_runs_batch_api(
    runs_batch: RunsBatchIn, archive: Optional[bool] = True, factory=Depends(object_factory)
):
    with factory:
        runs = factory.find_runs(runs_batch)
        if not runs:
            raise HTTPException(status_code=404)

        for run in runs:
            run.archived = archive

    return {'status': 'OK'}


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

    return {'status': 'OK'}


@runs_router.get('/{run_id}/logs/')
async def get_logs_api(run_id: str, record_range: Optional[str] = ''):
    repo = get_project_repo()
    run = get_run_or_404(run_id, repo=repo)

    return StreamingResponse(run_logs_streamer(run, record_range))


@runs_router.get('/{run_id}/log-records/')
async def get_log_records_api(run_id: str, record_range: Optional[str] = ''):
    repo = get_project_repo()
    run = get_run_or_404(run_id, repo=repo)

    return StreamingResponse(run_log_records_streamer(run, record_range))


def add_api_routes():
    ImageApiConfig.register_endpoints(runs_router)
    TextApiConfig.register_endpoints(runs_router)
    DistributionApiConfig.register_endpoints(runs_router)
    AudioApiConfig.register_endpoints(runs_router)
    FigureApiConfig.register_endpoints(runs_router)
