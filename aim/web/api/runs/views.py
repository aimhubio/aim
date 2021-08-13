from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from typing import Dict, List, Optional

from aim.storage import treeutils
from aim.web.api.projects.project import Project
from aim.web.api.runs.utils import (
    aligned_traces_dict_constructor,
    collect_requested_traces,
    query_runs_dict_constructor,
    query_traces_dict_constructor,
    encoded_tree_streamer
)
from aim.web.api.runs.pydantic_models import (
    MetricAlignApiIn,
    RunTracesBatchApiIn,
    RunMetricCustomAlignApiOut,
    RunMetricSearchApiOut,
    RunSearchApiOut,
    RunTracesApiOut,
    RunTracesBatchApiOut
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
@runs_router.get('/')
async def get_runs_list_api(include_archived: bool = False, factory=Depends(object_factory)):
    # TODO: [AT] add arbitrary filters to SDK runs() method
    if include_archived:
        response = [{'id': run.hashname, 'name': run.name} for run in factory.runs()]
    else:
        response = [{'id': run.hashname, 'name': run.name} for run in factory.runs() if not run.archived]
    return response


@runs_router.get('/search/')
async def search_runs_by_name_api(q: str = '', factory=Depends(object_factory)):
    search_term = q.strip()

    response = [{'id': run.hashname, 'name': run.name} for run in factory.search_runs(search_term)]
    return response


@runs_router.get('/{run_id}/')
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


@runs_router.put('/{run_id}/')
async def update_run_properties_api(run_id: str, request: Request, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        body = await request.json()
        run_name = body.get('name') or ''
        run_name = run_name.strip()
        description = body.get('description') or ''
        description = description.strip()
        archive = body.get('archive')
        if archive is not None:
            try:
                archive = bool(archive)
            except TypeError:
                raise HTTPException(status_code=400)
        has_experiment = 'experiment' in body
        if has_experiment:
            experiment = body.get('experiment')
        if archive:
            run.archived = archive
        if run_name:
            run.name = run_name
        if description:
            run.description = description
        if has_experiment:
            run.experiment = experiment

    return {
        'id': run.hashname,
        'status': 'OK'
    }


@runs_router.post('/{run_id}/tags/new/')
async def add_run_tag_api(run_id: str, request: Request, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        body = await request.json()
        tag_name = body.get('tag_name') or ''
        tag_name = tag_name.strip()
        if not tag_name:
            raise HTTPException(400)
        tag = run.add_tag(tag_name)

    return {
        'id': run.hashname,
        'tag_id': tag.uuid,
        'status': 'OK'
    }


@runs_router.delete('/{run_id}/tags/{tag_id}/')
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
