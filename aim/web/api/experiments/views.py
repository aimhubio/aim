from fastapi import Request, HTTPException, Depends

from aim.web.api.utils import APIRouter
from aim.web.api.utils import object_factory

experiment_router = APIRouter()


@experiment_router.get('/')
async def get_experiments_list_api(factory=Depends(object_factory)):
    response = [{'id': exp.uuid, 'name': exp.name, 'run_count': len(exp.runs)} for exp in factory.experiments()]
    return response


@experiment_router.get('/search/')
async def search_experiments_by_name_api(request: Request, factory=Depends(object_factory)):
    params = request.query_params
    search_term = params.get('q') or ''
    search_term.strip()

    response = [{'id': exp.uuid, 'name': exp.name, 'run_count': len(exp.runs)}
                for exp in factory.search_experiments(search_term)]
    return response


@experiment_router.post('/')
async def create_experiment_api(request: Request, factory=Depends(object_factory)):
    body = await request.json()
    exp_name = body.get('name') or ''
    if not exp_name:
        raise HTTPException(400)
    with factory:
        try:
            exp = factory.create_experiment(exp_name)
        except ValueError as e:
            raise HTTPException(400, detail=str(e))

        return {
            'id': exp.uuid,
            'status': 'OK'
        }


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


@experiment_router.put('/{exp_id}/')
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


