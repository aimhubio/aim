from fastapi import Request, HTTPException, Depends

from aim.web.api.utils import APIRouter
from aim.web.api.v2.helpers import object_factory

experiment_router = APIRouter()


@experiment_router.get('/list/')
async def get_experiments_list_api(factory=Depends(object_factory)):
    response = [{'id': exp.uuid, 'name': exp.name} for exp in factory.experiments()]
    return response


@experiment_router.post('/new/')
async def create_experiment_api(factory=Depends(object_factory)):
    with factory:
        pass


@experiment_router.get('/{exp_id}/')
async def get_experiment_api(exp_id: str, factory=Depends(object_factory)):
    exp = factory.find_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404)

    response = {
        'id': exp.uuid,
        'name': exp.name
    }
    return response


@experiment_router.post('/{exp_id}/')
async def update_experiment_properties_api(exp_id: str, request: Request, factory=Depends(object_factory)):
    with factory:
        exp = factory.find_experiment(exp_id)
        if not exp:
            raise HTTPException(status_code=404)
        body = await request.json()
        exp_name = body.get('name') or ''
        exp_name = exp_name.strip()
        if exp_name:
            exp.name = exp_name

    return {
        'id': exp.uuid,
        'status': 'OK'
    }


@experiment_router.get('/{exp_id}/runs/')
async def get_experiment_runs_api(exp_id: str, factory=Depends(object_factory)):
    exp = factory.find_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404)

    response = {
        'id': exp.uuid,
        'runs': [{'run_id': run.hash, 'name': run.name} for run in exp.runs]
    }
    return response


@experiment_router.delete('/{exp_id}/runs/{run_id}/')
async def remove_experiment_run_api(exp_id: str, run_id: str, factory=Depends(object_factory)):
    pass


