from collections import Counter
from datetime import timedelta
from typing import Optional

from aim.web.api.experiments.pydantic_models import (
    ExperimentActivityApiOut,
    ExperimentCreateIn,
    ExperimentGetOut,
    ExperimentGetRunsOut,
    ExperimentListOut,
    ExperimentUpdateIn,
    ExperimentUpdateOut,
)
from aim.web.api.projects.project import Project
from aim.web.api.runs.pydantic_models import NoteIn
from aim.web.api.runs.utils import get_project_repo
from aim.web.api.utils import (
    APIRouter,  # wrapper for fastapi.APIRouter  # wrapper for fastapi.APIRouter
    check_read_only,
    object_factory,
)
from fastapi import Depends, Header, HTTPException, Request


experiment_router = APIRouter()

# static msgs
NOTE_NOT_FOUND = 'Note with id {id} is not found in this experiment.'


@experiment_router.get('/', response_model=ExperimentListOut)
async def get_experiments_list_api(factory=Depends(object_factory)):
    return [
        {
            'id': exp.uuid,
            'name': exp.name,
            'description': exp.description,
            'run_count': len(exp.runs),
            'archived': exp.archived,
            'creation_time': exp.creation_time,
        }
        for exp in factory.experiments()
    ]


@experiment_router.get('/search/', response_model=ExperimentListOut)
async def search_experiments_by_name_api(request: Request, factory=Depends(object_factory)):
    params = request.query_params
    search_term = params.get('q') or ''
    search_term.strip()

    return [
        {'id': exp.uuid, 'name': exp.name, 'run_count': len(exp.runs), 'archived': exp.archived}
        for exp in factory.search_experiments(search_term)
    ]


@experiment_router.post('/', response_model=ExperimentUpdateOut)
async def create_experiment_api(exp_in: ExperimentCreateIn, factory=Depends(object_factory)):
    with factory:
        try:
            exp = factory.create_experiment(exp_in.name.strip())
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {'id': exp.uuid, 'status': 'OK'}


@experiment_router.get('/{exp_id}/', response_model=ExperimentGetOut)
async def get_experiment_api(exp_id: str, factory=Depends(object_factory)):
    exp = factory.find_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404)

    response = {
        'id': exp.uuid,
        'name': exp.name,
        'description': exp.description,
        'archived': exp.archived,
        'run_count': len(exp.runs),
        'creation_time': exp.creation_time,
    }
    return response


@experiment_router.delete('/{exp_id}/')
@check_read_only
async def delete_experiment_api(exp_id: str):
    repo = get_project_repo()
    success = repo.delete_experiment(exp_id)
    if not success:
        raise HTTPException(status_code=400, detail=(f"Failed to delete experiment '{exp_id}'."))

    return {'status': 'OK'}


@experiment_router.put('/{exp_id}/', response_model=ExperimentUpdateOut)
@check_read_only
async def update_experiment_properties_api(exp_id: str, exp_in: ExperimentUpdateIn, factory=Depends(object_factory)):
    exp = factory.find_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404)

    if exp_in.name:
        from sqlalchemy.exc import IntegrityError

        try:
            exp.name = exp_in.name.strip()
        except IntegrityError:
            exp.refresh_model()
            raise HTTPException(status_code=400, detail=(f"Experiment with name '{exp_in.name}' already exists."))
    if exp_in.description is not None:
        exp.description = exp_in.description
    if exp_in.archived is not None:
        if exp_in.archived and len(exp.runs) > 0:
            raise HTTPException(
                status_code=400, detail=(f"Cannot archive experiment '{exp_id}'. " 'Experiment has associated runs.')
            )
        exp.archived = exp_in.archived

    return {'id': exp.uuid, 'status': 'OK'}


@experiment_router.get('/{exp_id}/runs/', response_model=ExperimentGetRunsOut)
async def get_experiment_runs_api(
    exp_id: str, limit: Optional[int] = None, offset: Optional[str] = None, factory=Depends(object_factory)
):
    project = Project()

    exp = factory.find_experiment(exp_id)
    if not exp:
        raise HTTPException(status_code=404)

    from aim.sdk.run import Run

    cache_name = 'exp_runs'
    project.repo.run_props_cache_hint = cache_name
    project.repo.structured_db.invalidate_cache(cache_name)
    project.repo.structured_db.init_cache(cache_name, exp.get_runs, lambda run_: run_.hash)
    exp_runs = []

    run_hashes = [run.hash for run in exp.runs]
    offset_idx = 0
    if offset:
        try:
            offset_idx = run_hashes.index(offset) + 1
        except ValueError:
            pass
    if limit:
        run_hashes = run_hashes[offset_idx : offset_idx + limit]

    for run_hash in run_hashes:
        run = Run(run_hash, repo=project.repo, read_only=True)
        exp_runs.append(
            {
                'run_id': run.hash,
                'name': run.name,
                'creation_time': run.creation_time,
                'end_time': run.end_time,
                'archived': run.archived,
            }
        )

    project.repo.structured_db.invalidate_cache(cache_name)
    project.repo.run_props_cache_hint = None

    response = {'id': exp.uuid, 'runs': exp_runs}
    return response


# Note APIs


@experiment_router.get('/{exp_id}/note/')
async def list_note_api(exp_id, factory=Depends(object_factory)):
    with factory:
        experiment = factory.find_experiment(exp_id)
        if not experiment:
            raise HTTPException(status_code=404)

        notes = experiment.notes

    return notes


@experiment_router.post('/{exp_id}/note/', status_code=201)
async def create_note_api(exp_id, note_in: NoteIn, factory=Depends(object_factory)):
    with factory:
        experiment = factory.find_experiment(exp_id)
        if not experiment:
            raise HTTPException(status_code=404)

        note_content = note_in.content.strip()
        note = experiment.add_note(note_content)

    return {
        'id': note.id,
        'created_at': note.created_at,
    }


@experiment_router.get('/{exp_id}/note/{_id}')
async def get_note_api(exp_id, _id: int, factory=Depends(object_factory)):
    with factory:
        experiment = factory.find_experiment(exp_id)
        if not experiment:
            raise HTTPException(status_code=404)

        note = experiment.find_note(_id=_id)
        if not note:
            raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND.format(id=_id))

    return {
        'id': note.id,
        'content': note.content,
        'updated_at': note.updated_at,
    }


@experiment_router.put('/{exp_id}/note/{_id}')
async def update_note_api(exp_id, _id: int, note_in: NoteIn, factory=Depends(object_factory)):
    with factory:
        experiment = factory.find_experiment(exp_id)
        if not experiment:
            raise HTTPException(status_code=404)

        note = experiment.find_note(_id=_id)
        if not note:
            raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND.format(id=_id))

        content = note_in.content.strip()
        updated_note = experiment.update_note(_id=_id, content=content)

    return {
        'id': updated_note.id,
        'content': updated_note.content,
        'updated_at': updated_note.updated_at,
    }


@experiment_router.delete('/{exp_id}/note/{_id}')
async def delete_note_api(exp_id, _id: int, factory=Depends(object_factory)):
    with factory:
        experiment = factory.find_experiment(exp_id)
        if not experiment:
            raise HTTPException(status_code=404)

        note = experiment.find_note(_id=_id)
        if not note:
            raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND.format(id=_id))

        experiment.remove_note(_id)

    return {'status': 'OK'}


@experiment_router.get('/{exp_id}/activity/', response_model=ExperimentActivityApiOut)
async def experiment_runs_activity_api(
    exp_id, x_timezone_offset: int = Header(default=0), factory=Depends(object_factory)
):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    with factory:
        experiment = factory.find_experiment(exp_id)
        if not experiment:
            raise HTTPException(status_code=404)

        active_run_hashes = project.repo.list_active_runs()

        num_runs = 0
        num_archived_runs = 0
        num_active_runs = 0
        activity_counter = Counter()

        for run in experiment.runs:
            creation_time = run.created_at - timedelta(minutes=x_timezone_offset)
            activity_counter[creation_time.strftime('%Y-%m-%dT%H:00:00')] += 1
            num_runs += 1
            if run.archived:
                num_archived_runs += 1
            if run.hash in active_run_hashes:
                num_active_runs += 1

        return {
            'num_runs': num_runs,
            'num_archived_runs': num_archived_runs,
            'num_active_runs': num_active_runs,
            'activity_map': dict(activity_counter),
        }
