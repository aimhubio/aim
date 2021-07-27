from fastapi import HTTPException, Request, Depends

from aim.web.api.utils import APIRouter
from aim.web.api.v2.helpers import object_factory

run_router = APIRouter()

# TODO: [AT] implement model serializers (JSON) and request validators (discuss with BE team about possible solutions)


@run_router.get('/list/')
async def get_runs_list_api(request: Request, factory=Depends(object_factory)):
    params = request.query_params
    include_archived = False
    if params.get('include_archived'):
        try:
            include_archived = bool(params.get('include_archived'))
        except TypeError:
            raise HTTPException(status_code=403)

    # TODO: [AT] add arbitrary filters to SDK runs() method
    if include_archived:
        response = [{'id': run.hash, 'name': run.name} for run in factory.runs()]
    else:
        response = [{'id': run.hash, 'name': run.name} for run in factory.runs() if not run.archived]
    return response


@run_router.get('/search/')
async def search_runs_by_name_api(request: Request, factory=Depends(object_factory)):
    body = await request.json()
    search_term = body.get('name') or ''
    search_term.strip()

    response = [{'id': run.hash, 'name': run.name} for run in factory.search_runs(search_term)]
    return response


@run_router.get('/{run_id}/')
async def get_run_api(run_id: str, factory=Depends(object_factory)):
    run = factory.find_run(run_id)
    if not run:
        raise HTTPException(status_code=404)

    response = {
        'id': run.hash,
        'name': run.name,
        'description': run.description or '',
        'experiment': {'experiment_id': run.experiment.uuid, 'name': run.experiment.name} if run.experiment else '',
        'tags': [{'tag_id': tag.uuid, 'name': tag.name} for tag in run.tags]
    }
    return response


@run_router.post('/{run_id}/')
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
        if archive:
            try:
                archive = bool(archive)
            except TypeError:
                raise HTTPException(status_code=403)

        if archive:
            run.archived = archive
        if run_name:
            run.name = run_name
        if description:
            run.description = description

    return {
        'id': run.hash,
        'status': 'OK'
    }
