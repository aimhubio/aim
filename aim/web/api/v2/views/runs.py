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
            raise HTTPException(status_code=400)

    # TODO: [AT] add arbitrary filters to SDK runs() method
    if include_archived:
        response = [{'id': run.hash, 'name': run.name} for run in factory.runs()]
    else:
        response = [{'id': run.hash, 'name': run.name} for run in factory.runs() if not run.archived]
    return response


@run_router.get('/search/')
async def search_runs_by_name_api(request: Request, factory=Depends(object_factory)):
    params = request.query_params
    search_term = params.get('q') or ''
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
        'archived': run.archived,
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
        'id': run.hash,
        'status': 'OK'
    }


@run_router.post('/{run_id}/tags/new/')
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
        'id': run.hash,
        'tag_id': tag.uuid,
        'status': 'OK'
    }


@run_router.delete('/{run_id}/tags/{tag_id}/')
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
