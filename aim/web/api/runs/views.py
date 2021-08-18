from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from typing import Optional

from aim.storage import treeutils
from aim.web.api.projects.project import Project
from aim.web.api.runs.utils import (
    aligned_traces_dict_constructor,
    collect_requested_traces,
    get_run_props,
    encoded_tree_streamer,
    query_runs_dict_constructor,
    query_traces_dict_constructor,
)
from aim.web.api.runs.pydantic_models import (
    MetricAlignApiIn,
    RunTracesBatchApiIn,
    RunMetricCustomAlignApiOut,
    RunMetricSearchApiOut,
    RunInfoOut,
    RunSearchApiOut,
    RunTracesBatchApiOut,
    StructuredRunUpdateIn,
    StructuredRunUpdateOut,
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
    runs_dict = query_runs_dict_constructor(runs)
    encoded_runs_tree = treeutils.encode_tree(runs_dict)

    return StreamingResponse(encoded_tree_streamer(encoded_runs_tree))


@runs_router.post('/search/metric/align/', response_model=RunMetricCustomAlignApiOut)
async def run_metric_custom_align_api(request_data: MetricAlignApiIn):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    x_axis_metric_name = request_data.align_by
    requested_runs = request_data.runs

    processed_runs = aligned_traces_dict_constructor(requested_runs, x_axis_metric_name)
    encoded_runs_tree = treeutils.encode_tree(processed_runs)

    return StreamingResponse(encoded_tree_streamer(encoded_runs_tree))


@runs_router.get('/search/metric/', response_model=RunMetricSearchApiOut)
async def run_metric_search_api(q: str, p: int = 50,  x_axis: Optional[str] = None):
    steps_num = p

    if x_axis:
        x_axis = x_axis.strip()

    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    search_statement = q.strip()

    traces = project.repo.traces(query=search_statement)
    runs_dict = query_traces_dict_constructor(traces, steps_num, x_axis)
    encoded_runs_tree = treeutils.encode_tree(runs_dict)

    return StreamingResponse(encoded_tree_streamer(encoded_runs_tree))


@runs_router.get('/{run_id}/info/', response_model=RunInfoOut)
async def run_params_api(run_id: str):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(hashname=run_id)
    if not run:
        raise HTTPException(status_code=404)

    response = {
        'params': run[...],
        'traces': run.get_traces_overview(),
        'props': get_run_props(run)
    }
    print(response)
    return JSONResponse(response)


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
