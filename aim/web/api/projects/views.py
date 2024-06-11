import os
from datetime import timedelta
from typing import Optional, Tuple
from logging import getLogger
from collections import Counter
from fastapi import Depends, HTTPException, Query, Header
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter

from aim.web.configs import AIM_PROJECT_SETTINGS_FILE
from aim.web.api.projects.project import Project
from aim.web.api.projects.pydantic_models import (
    ProjectActivityApiOut,
    ProjectApiOut,
    ProjectParamsOut,
    ProjectPinnedSequencesApiIn,
    ProjectPinnedSequencesApiOut,
)
from aim.web.api.utils import object_factory
from aim.sdk.index_manager import RepoIndexManager
from aim.storage.locking import AutoFileLock

projects_router = APIRouter()

logger = getLogger()


@projects_router.get('/', response_model=ProjectApiOut)
async def project_api():
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    # check if the index db was corrupted and deleted
    index_corrupted = project.repo.is_index_corrupted()
    if index_corrupted:
        runs_corrupted = False  # prevent multiple alert banners in UI
        logger.warning('Index db was corrupted and deleted. '
                       'Please run `aim storage reindex` command to restore optimal performance.')
    else:
        # check are there any corrupted run chunks
        runs_corrupted = len(project.repo.list_corrupted_runs()) > 0
        if runs_corrupted:
            logger.warning('Corrupted Runs were detected. '
                           'Please run `aim runs rm --corrupted` command to remove corrupted runs. '
                           'You can list corrupted run hashes using `aim runs ls --corrupted` command.')

    return {
        'name': project.name,
        'path': project.path,
        'description': project.description,
        'telemetry_enabled': 0,
        'warn_index': index_corrupted,
        'warn_runs': runs_corrupted,
    }


@projects_router.get('/activity/', response_model=ProjectActivityApiOut)
async def project_activity_api(x_timezone_offset: int = Header(default=0),
                               factory=Depends(object_factory)):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    num_runs = 0
    num_archived_runs = 0
    activity_counter = Counter()
    for run in factory.runs():
        creation_time = run.created_at - timedelta(minutes=x_timezone_offset)
        activity_counter[creation_time.strftime('%Y-%m-%dT%H:00:00')] += 1
        num_runs += 1
        if run.archived:
            num_archived_runs += 1

    return {
        'num_experiments': len(factory.experiments()),
        'num_runs': num_runs,
        'num_archived_runs': num_archived_runs,
        'num_active_runs': len(project.repo.list_active_runs()),
        'activity_map': dict(activity_counter),
    }


@projects_router.get('/pinned-sequences/', response_model=ProjectPinnedSequencesApiOut)
async def get_pinned_metrics_api():
    import json
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    response = {'sequences': []}
    settings_filename = os.path.join(project.repo_path, AIM_PROJECT_SETTINGS_FILE)
    settings_lock_file = f'{settings_filename}.lock'
    if not os.path.exists(settings_filename):
        return response

    with AutoFileLock(settings_lock_file, timeout=2):
        with open(settings_filename, 'r') as settings_file:
            try:
                settings = json.load(settings_file)
            except json.decoder.JSONDecodeError:
                return response
            sequences_list = settings.get('pinned_sequences', {}).get('metric', [])
            response['sequences'] = sequences_list
            return response


@projects_router.post('/pinned-sequences/', response_model=ProjectPinnedSequencesApiOut)
async def update_pinned_metrics_api(request_data: ProjectPinnedSequencesApiIn):
    import json
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    request_dict = request_data.dict()
    sequences_list = request_dict.get('sequences', [])

    # read current settings
    settings_filename = os.path.join(project.repo_path, AIM_PROJECT_SETTINGS_FILE)
    settings_lock_file = f'{settings_filename}.lock'
    settings = {}
    with AutoFileLock(settings_lock_file, timeout=2):
        mode = 'r+'
        if not os.path.exists(settings_filename):
            mode = 'w+'
        with open(settings_filename, mode) as settings_file:
            try:
                settings = json.load(settings_file)
            except json.decoder.JSONDecodeError:
                pass
            settings['pinned_sequences'] = {'metric': sequences_list}
            settings_file.seek(0)
            # dump new settings
            json.dump(settings, settings_file)
            settings_file.truncate()

    return {'sequences': sequences_list}


@projects_router.get('/params/', response_model=ProjectParamsOut, response_model_exclude_defaults=True)
async def project_params_api(sequence: Optional[Tuple[str, ...]] = Query(()),
                             exclude_params: Optional[bool] = False):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    if sequence != ():
        try:
            project.repo.validate_sequence_types(sequence)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        sequence = project.repo.available_sequence_types()
    if exclude_params:
        response = {}
    else:
        response = {
            'params': project.repo.collect_params_info(),
        }
    response.update(**project.repo.collect_sequence_info(sequence))
    return response


@projects_router.get('/status/')
async def project_status_api():
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    return RepoIndexManager.get_index_manager(project.repo).repo_status
