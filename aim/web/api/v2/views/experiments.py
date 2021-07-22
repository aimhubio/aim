from fastapi import HTTPException, Request

from aim.web.api.utils import APIRouter
from aim.web.api.projects.project import Project
from aim.storage.run_metadata.models import Experiment, Run

experiment_router = APIRouter()


@experiment_router.get('/list/')
async def get_experiments_list_api():
    pass


@experiment_router.post('/new/')
async def create_experiment_api():
    pass


@experiment_router.get('/{exp_id}/')
async def get_experiment_api(exp_id: str):
    pass


@experiment_router.post('/{exp_id}/')
async def update_experiment_properties_api(exp_id: str, request: Request):
    pass


@experiment_router.get('/{exp_id}/runs/')
async def get_experiment_runs_api(exp_id: str):
    pass


@experiment_router.delete('/{exp_id}/runs/{run_id}/')
async def remove_experiment_run_api(exp_id: str, run_id: str):
    pass


