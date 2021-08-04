from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter

from typing import Optional

from aim.storage import treeutils
from aim.web.api.projects.project import Project
from aim.web.api.commits.utils import (
    aligned_traces_dict_constructor,
    collect_requested_traces,
    query_runs_dict_constructor,
    query_traces_dict_constructor,
    encoded_tree_streamer
)

commits_router = APIRouter()


@commits_router.get('/search/run/')
async def commits_search_api(q: Optional[str] = ''):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    query = q.strip()
    runs = project.repo.query_runs(query=query)
    runs_dict = query_runs_dict_constructor(runs)
    encoded_runs_tree = treeutils.encode_tree(runs_dict)

    return StreamingResponse(encoded_tree_streamer(encoded_runs_tree))


@commits_router.post('/search/metric/align/')
async def commits_metric_custom_align_api(request: Request):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    request_data = await request.json()

    x_axis_metric_name = request_data.get('align_by')
    requested_runs = request_data.get('runs')
    if not (x_axis_metric_name and requested_runs):
        HTTPException(status_code=403)

    processed_runs = aligned_traces_dict_constructor(requested_runs, x_axis_metric_name)
    encoded_runs_tree = treeutils.encode_tree(processed_runs)

    return StreamingResponse(encoded_tree_streamer(encoded_runs_tree))


@commits_router.get('/search/metric/')
async def commit_metric_search_api(q: str, p: int = 50,  x_axis: Optional[str] = None):
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


@commits_router.get('/{run_id}/params/')
async def run_traces_api(run_id: str):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404)
    return JSONResponse(run.get_params())


@commits_router.get('/{run_id}/traces/')
async def run_params_api(run_id: str):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404)
    return JSONResponse(run.get_traces_overview())


@commits_router.post('/{run_id}/traces/batch/')
async def run_traces_batch(run_id: str, request: Request):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)
    run = project.repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404)

    requested_traces = await request.json()
    traces_data = collect_requested_traces(run, requested_traces)

    return JSONResponse(traces_data)
