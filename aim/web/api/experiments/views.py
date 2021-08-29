from fastapi import Request, HTTPException, Depends

from aim.web.api.utils import APIRouter
from aim.web.api.utils import object_factory
from aim.web.api.experiments.pydantic_models import (
    ExperimentGetOut,
    ExperimentUpdateOut,
    ExperimentGetRunsOut,
    ExperimentListOut,
    ExperimentCreateIn,
    ExperimentUpdateIn
)

experiment_router = APIRouter()


@experiment_router.get('/', response_model=ExperimentListOut)
async def get_experiments_list_api(factory=Depends(object_factory)):
    return [{'id': exp.uuid, 'name': exp.name, 'run_count': len(exp.runs), 'archived': exp.archived}
            for exp in factory.experiments()]


@experiment_router.get('/search/', response_model=ExperimentListOut)
async def search_experiments_by_name_api(request: Request, factory=Depends(object_factory)):
    params = request.query_params
    search_term = params.get('q') or ''
    search_term.strip()

    return [{'id': exp.uuid, 'name': exp.name, 'run_count': len(exp.runs), 'archived': exp.archived}
            for exp in factory.search_experiments(search_term)]


@experiment_router.post('/', response_model=ExperimentUpdateOut)
async def create_experiment_api(exp_in: ExperimentCreateIn, factory=Depends(object_factory)):
    with factory:
        try:
            exp = factory.create_experiment(exp_in.name.strip())
        except ValueError as e:
            raise HTTPException(400, detail=str(e))

    return {
        'id': exp.uuid,
        'status': 'OK'
    }


@experiment_router.get('/{exp_id}/', response_model=ExperimentGetOut)
async def get_experiment_api(exp_id: str, factory=Depends(object_factory)):
    exp = factory.find_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404)

    response = {
        'id': exp.uuid,
        'name': exp.name,
        'archived': exp.archived,
        'run_count': len(exp.runs)
    }
    return response


@experiment_router.put('/{exp_id}/', response_model=ExperimentUpdateOut)
async def update_experiment_properties_api(exp_id: str, exp_in: ExperimentUpdateIn, factory=Depends(object_factory)):
    with factory:
        exp = factory.find_experiment(exp_id)
        if not exp:
            raise HTTPException(status_code=404)

        if exp_in.name:
            exp.name = exp_in.name.strip()
        if exp_in.archived is not None:
            if exp_in.archived and len(exp.runs) > 0:
                raise HTTPException(status_code=400,
                                    detail=f'Cannot archive experiment \'{exp_id}\'. Experiment has associated runs.')
            exp.archived = exp_in.archived

    return {
        'id': exp.uuid,
        'status': 'OK'
    }


@experiment_router.get('/{exp_id}/runs/', response_model=ExperimentGetRunsOut)
async def get_experiment_runs_api(exp_id: str, factory=Depends(object_factory)):
    exp = factory.find_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404)

    response = {
        'id': exp.uuid,
        'runs': [{'run_id': run.hashname, 'name': run.name} for run in exp.runs]
    }
    return response
