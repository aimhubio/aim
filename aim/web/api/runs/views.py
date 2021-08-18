from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from typing import Optional

from aim.web.api.projects.project import Project
from aim.web.api.runs.utils import (
    collect_requested_traces,
    custom_aligned_metrics_streamer,
    metric_search_result_streamer,
    run_search_result_streamer
)
from aim.web.api.runs.pydantic_models import (
    MetricAlignApiIn,
    RunTracesBatchApiIn,
    RunMetricCustomAlignApiOut,
    RunMetricSearchApiOut,
    RunSearchApiOut,
    RunTracesApiOut,
    RunTracesBatchApiOut,
    StructuredRunUpdateIn,
    StructuredRunUpdateOut,
    StructuredRunListOut,
    StructuredRunOut,
    StructuredRunAddTagIn,
    StructuredRunAddTagOut,
    StructuredRunRemoveTagOut
)
from aim.web.api.utils import object_factory

runs_router = APIRouter()


@runs_router.get('/search/run/', response_model=RunSearchApiOut)
async def run_search_api(q: Optional[str] = ''):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    query = q.strip()
    runs = project.repo.query_runs(query=query)

    streamer = run_search_result_streamer(runs)
    return StreamingResponse(streamer)


@runs_router.post('/search/metric/align/', response_model=RunMetricCustomAlignApiOut)
async def run_metric_custom_align_api(request_data: MetricAlignApiIn):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    x_axis_metric_name = request_data.align_by
    requested_runs = request_data.runs

    streamer = custom_aligned_metrics_streamer(requested_runs, x_axis_metric_name)
    return StreamingResponse(streamer)


@runs_router.get('/search/metric/', response_model=RunMetricSearchApiOut)
async def run_metric_search_api(q: Optional[str] = '', p: int = 50,  x_axis: Optional[str] = None):
    steps_num = p

    if x_axis:
        x_axis = x_axis.strip()

    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    search_statement = q.strip()
    traces = project.repo.traces(query=search_statement)

    streamer = metric_search_result_streamer(traces, steps_num, x_axis)
    return StreamingResponse(streamer)


@runs_router.get('/{run_id}/params/', response_model=dict)
async def run_params_api(run_id: str):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(hashname=run_id)
    if not run:
        raise HTTPException(status_code=404)
    return JSONResponse(run[...])


@runs_router.get('/{run_id}/traces/', response_model=RunTracesApiOut)
async def run_traces_api(run_id: str):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(hashname=run_id)
    if not run:
        raise HTTPException(status_code=404)
    return JSONResponse(run.get_traces_overview())


@runs_router.post('/{run_id}/traces/get-batch/', response_model=RunTracesBatchApiOut)
async def run_traces_batch_api(run_id: str, requested_traces: RunTracesBatchApiIn):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(hashname=run_id)
    if not run:
        raise HTTPException(status_code=404)

    traces_data = collect_requested_traces(run, requested_traces)

    return JSONResponse(traces_data)


# TODO: [AT] implement model serializers (JSON) and request validators (discuss with BE team about possible solutions)
@runs_router.get('/', response_model=StructuredRunListOut)
async def get_runs_list_api(include_archived: bool = False, factory=Depends(object_factory)):
    # TODO: [AT] add arbitrary filters to SDK runs() method
    if include_archived:
        response = [{'id': run.hashname, 'name': run.name} for run in factory.runs()]
    else:
        response = [{'id': run.hashname, 'name': run.name} for run in factory.runs() if not run.archived]
    return response


@runs_router.get('/search/', response_model=StructuredRunListOut)
async def search_runs_by_name_api(q: str = '', factory=Depends(object_factory)):
    search_term = q.strip()

    response = [{'id': run.hashname, 'name': run.name} for run in factory.search_runs(search_term)]
    return response


@runs_router.get('/{run_id}/', response_model=StructuredRunOut)
async def get_run_api(run_id: str, factory=Depends(object_factory)):
    run = factory.find_run(run_id)
    if not run:
        raise HTTPException(status_code=404)

    response = {
        'id': run.hashname,
        'name': run.name,
        'archived': run.archived,
        'description': run.description or '',
        'experiment': {'experiment_id': run.experiment.uuid, 'name': run.experiment.name} if run.experiment else '',
        'tags': [{'tag_id': tag.uuid, 'name': tag.name} for tag in run.tags]
    }
    return response


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
        'id': run.hashname,
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
        'id': run.hashname,
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
        'id': run.hashname,
        'removed': removed,
        'status': 'OK'
    }
