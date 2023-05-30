import os
from datetime import timedelta
from typing import Optional, Tuple

from collections import Counter
from fastapi import Depends, HTTPException, Query, Header
from aimcore.web.api.utils import get_project_repo, \
    APIRouter  # wrapper for fastapi.APIRouter

from aimcore.web.configs import AIM_PROJECT_SETTINGS_FILE
from aimcore.web.api.projects.project import Project
from aimcore.web.api.projects.pydantic_models import (
    ProjectActivityApiOut,
    ProjectApiOut,
    ProjectParamsOut,
    ProjectPinnedSequencesApiIn,
    ProjectPinnedSequencesApiOut,
    ProjectPackagesApiOut
)
from aimcore.web.api.utils import object_factory
from aim._core.storage.locking import AutoFileLock
from aim._ext.tracking import analytics

projects_router = APIRouter()


@projects_router.get('/', response_model=ProjectApiOut)
async def project_api():
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    return {
        'name': project.name,
        'path': project.path,
        'description': project.description,
        'telemetry_enabled': analytics.telemetry_enabled,
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


@projects_router.get('/info/')
async def project_info_api(sequence: Optional[Tuple[str, ...]] = Query(default=()),
                           params: Optional[bool] = False):
    repo = get_project_repo()
    if sequence == ():
        sequence = repo.tracked_sequence_types()
    response = {}
    if params:
        response['params'] = repo.tracked_params()
    response['sequences'] = {seq_type: repo.tracked_sequence_infos(seq_type)
                             for seq_type in sequence}
    return response


@projects_router.get('/packages/', response_model=ProjectPackagesApiOut)
async def project_packages_api(include_types: Optional[bool] = False):
    from aim._sdk.package_utils import Package
    if include_types:
        return {
            pkg.name: {
                'containers': pkg.containers,
                'sequences': pkg.sequences
            } for pkg in Package.pool.values()}
    else:
        return list(Package.pool.keys())


@projects_router.get('/sequence-types/')
async def project_sequence_types_api(only_tracked: Optional[bool] = False):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    if only_tracked:
        return project.repo.tracked_sequence_types()
    else:
        return project.repo.registered_sequence_types()


@projects_router.get('/container-types/')
async def project_container_types_api(only_tracked: Optional[bool] = False):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    if only_tracked:
        return project.repo.tracked_container_types()
    else:
        return project.repo.registered_container_types()
