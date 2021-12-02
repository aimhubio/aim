from fastapi import Depends, HTTPException, Query
from fastapi.responses import JSONResponse, StreamingResponse
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from typing import Optional, Tuple

from aim.web.api.projects.project import Project
from aim.web.api.runs.utils import (
    collect_requested_metric_traces,
    requested_distribution_traces_streamer,
    custom_aligned_metrics_streamer,
    get_run_props,
    metric_search_result_streamer,
    run_search_result_streamer,
    str_to_range,
)
from aim.web.api.runs.image_utils import (
    requested_image_traces_streamer,
    image_search_result_streamer,
    images_batch_result_streamer,
)
from aim.web.api.runs.pydantic_models import (
    MetricAlignApiIn,
    QuerySyntaxErrorOut,
    RunTracesBatchApiIn,
    RunMetricCustomAlignApiOut,
    RunMetricSearchApiOut,
    RunImagesSearchApiOut,
    RunInfoOut,
    RunSearchApiOut,
    RunMetricsBatchApiOut,
    RunImagesBatchApiOut,
    RunDistributionsBatchApiOut,
    StructuredRunUpdateIn,
    StructuredRunUpdateOut,
    StructuredRunAddTagIn,
    StructuredRunAddTagOut,
    StructuredRunRemoveTagOut,
    URIBatchIn
)
from aim.web.api.utils import object_factory
from aim.storage.query import syntax_error_check
runs_router = APIRouter()


@runs_router.get('/search/run/', response_model=RunSearchApiOut,
                 responses={400: {'model': QuerySyntaxErrorOut}})
def run_search_api(q: Optional[str] = '', limit: Optional[int] = 0, offset: Optional[str] = None):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    query = q.strip()
    try:
        syntax_error_check(query)
    except SyntaxError as se:
        raise HTTPException(status_code=400, detail={
            "name": "SyntaxError",
            "statement": se.text,
            "line": se.lineno,
            "offset": se.offset
        })
    runs = project.repo.query_runs(query=query, paginated=bool(limit), offset=offset)

    streamer = run_search_result_streamer(runs, limit)
    return StreamingResponse(streamer)


@runs_router.post('/search/metric/align/', response_model=RunMetricCustomAlignApiOut)
def run_metric_custom_align_api(request_data: MetricAlignApiIn):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    x_axis_metric_name = request_data.align_by
    requested_runs = request_data.runs

    streamer = custom_aligned_metrics_streamer(requested_runs, x_axis_metric_name, project.repo)
    return StreamingResponse(streamer)


@runs_router.get('/search/metric/', response_model=RunMetricSearchApiOut,
                 responses={400: {'model': QuerySyntaxErrorOut}})
async def run_metric_search_api(q: Optional[str] = '',
                                p: Optional[int] = 50,
                                x_axis: Optional[str] = None):
    steps_num = p

    if x_axis:
        x_axis = x_axis.strip()

    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    query = q.strip()
    try:
        syntax_error_check(query)
    except SyntaxError as se:
        raise HTTPException(status_code=400, detail={
            "name": "SyntaxError",
            "statement": se.text,
            "line": se.lineno,
            "offset": se.offset
        })

    traces = project.repo.query_metrics(query=query)

    streamer = metric_search_result_streamer(traces, steps_num, x_axis)
    return StreamingResponse(streamer)


@runs_router.get('/search/images/', response_model=RunImagesSearchApiOut,
                 responses={400: {'model': QuerySyntaxErrorOut}})
async def run_images_search_api(q: Optional[str] = '',
                                record_range: Optional[str] = '', record_density: Optional[int] = 50,
                                index_range: Optional[str] = '', index_density: Optional[int] = 5,
                                calc_ranges: Optional[bool] = False):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    query = q.strip()
    try:
        syntax_error_check(query)
    except SyntaxError as se:
        raise HTTPException(status_code=400, detail={
            "name": "SyntaxError",
            "statement": se.text,
            "line": se.lineno,
            "offset": se.offset
        })

    traces = project.repo.query_images(query=query)

    try:
        record_range = str_to_range(record_range)
        index_range = str_to_range(index_range)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid range format')

    streamer = image_search_result_streamer(traces, record_range, record_density,
                                            index_range, index_density, calc_ranges)
    return StreamingResponse(streamer)


@runs_router.post('/images/get-batch/')
def image_blobs_batch_api(uri_batch: URIBatchIn):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    return StreamingResponse(images_batch_result_streamer(uri_batch, project.repo))


@runs_router.get('/{run_id}/info/', response_model=RunInfoOut)
async def run_params_api(run_id: str, sequence: Optional[Tuple[str, ...]] = Query(())):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404)

    if sequence != ():
        try:
            project.repo.validate_sequence_types(sequence)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        sequence = project.repo.available_sequence_types()

    response = {
        'params': run.get(...),
        'traces': run.collect_sequence_info(sequence, skip_last_value=True),
        'props': get_run_props(run)
    }
    return JSONResponse(response)


@runs_router.post('/{run_id}/metric/get-batch/', response_model=RunMetricsBatchApiOut)
async def run_metric_batch_api(run_id: str, requested_traces: RunTracesBatchApiIn):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404)

    traces_data = collect_requested_metric_traces(run, requested_traces)

    return JSONResponse(traces_data)


@runs_router.post('/{run_id}/images/get-batch/', response_model=RunImagesBatchApiOut)
async def run_images_batch_api(run_id: str,
                               requested_traces: RunTracesBatchApiIn,
                               record_range: Optional[str] = '', record_density: Optional[int] = 50,
                               index_range: Optional[str] = '', index_density: Optional[int] = 5):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404)

    try:
        record_range = str_to_range(record_range)
        index_range = str_to_range(index_range)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid range format')

    traces_streamer = requested_image_traces_streamer(run, requested_traces,
                                                      record_range, index_range,
                                                      record_density, index_density)

    return StreamingResponse(traces_streamer)


@runs_router.post('/{run_id}/distributions/get-batch/', response_model=RunDistributionsBatchApiOut)
async def run_distributions_batch_api(run_id: str,
                                      requested_traces: RunTracesBatchApiIn,
                                      record_range: Optional[str] = '',
                                      record_density: Optional[int] = 50):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404)
    try:
        record_range = str_to_range(record_range)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid range format')

    traces_streamer = requested_distribution_traces_streamer(run, requested_traces, record_range, record_density)

    return StreamingResponse(traces_streamer)


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

        tag = run.add_tag(tag_in.tag_name)

    return {
        'id': run.hash,
        'tag_id': tag.uuid,
        'status': 'OK'
    }


@runs_router.delete('/{run_id}/tags/{tag_id}/', response_model=StructuredRunRemoveTagOut)
async def remove_run_tag_api(run_id: str, tag_id: str, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        removed = run.remove_tag(tag_id)

    return {
        'id': run.hash,
        'removed': removed,
        'status': 'OK'
    }
