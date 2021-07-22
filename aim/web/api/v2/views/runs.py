from fastapi import HTTPException, Request

from aim.web.api.utils import APIRouter
from aim.web.api.projects.project import Project
from aim.storage.run_metadata.models import Run

run_router = APIRouter()

# TODO: [AT] implement model serializers (JSON) and request validators (discuss with BE team about possible solutions)


@run_router.get('/list/')
async def get_runs_list_api(request: Request):
    params = request.query_params
    include_archived = False
    if params.get('include_archived'):
        try:
            include_archived = bool(params.get('include_archived'))
        except TypeError:
            raise HTTPException(status_code=403)

    # TODO: [AT] find better way to access run_metadata_db
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    repo = project.repo
    db = repo.run_metadata_db
    session = db.get_session()
    q = session.query(Run)
    if not include_archived:
        q = q.filter(Run.is_archived.is_(False))
    runs = q.all()
    response = []
    for run in runs:
        response.append({
            'id': run.uuid,
            'name': run.name,
            'run_hash': run.run_hash
        })
    return response


@run_router.get('/search/')
async def search_runs_by_name_api(request: Request):
    body = await request.json()
    search_term = body.get('name') or ''
    search_term.strip()
    if not search_term:
        raise HTTPException(status_code=403)
    search_term = f'%{search_term}%'

    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    repo = project.repo
    db = repo.run_metadata_db
    session = db.get_session()
    runs = session.query(Run).filter(Run.is_archived.is_(False)).filter(Run.name.like(search_term)).all()
    response = []
    for run in runs:
        response.append({
            'id': run.uuid,
            'name': run.name,
            'run_hash': run.run_hash
        })
    return response


@run_router.get('/{run_id}/')
async def get_run_api(run_id: str):
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    repo = project.repo
    db = repo.run_metadata_db
    session = db.get_session()
    # TODO: [AT] load relationships upfront with sqlalchemy query options()
    run = session.query(Run).filter(Run.uuid == run_id).first()
    if not run:
        raise HTTPException(status_code=404)

    return {
        'id': run.uuid,
        'name': run.name,
        'description': run.description or '',
        'run_hash': run.run_hash,
        'experiment': {'experiment_id': run.experiment.uuid, 'name': run.experiment.name} if run.experiment else '',
        'tags': [{'tag_id': tag.uuid, 'name': tag.name} for tag in run.tags]
    }


@run_router.post('/{run_id}/')
async def update_run_properties_api(run_id: str, request: Request):
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    repo = project.repo
    db = repo.run_metadata_db
    session = db.get_session()
    run = session.query(Run).filter(Run.uuid == run_id).first()
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
        run.is_archived = archive
    if run_name:
        run.name = run_name
    if description:
        run.description = description
    session.commit()

    return {
        'id': run.uuid,
        'status': 'OK'
    }
