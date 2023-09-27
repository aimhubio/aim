from typing import Optional, Tuple

from fastapi import Depends, HTTPException, Query
from aimcore.web.api.utils import get_project_repo, \
    APIRouter  # wrapper for fastapi.APIRouter

from aimcore.web.api.projects.project import Project
from aimcore.web.api.projects.pydantic_models import (
    ProjectApiOut,
    ProjectPackagesApiOut
)
from aimcore.web.utils import load_active_packages
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
async def project_packages_api(names_only: Optional[bool] = False,
                               packages=Depends(load_active_packages)):
    from aim._sdk.package_utils import Package
    if not names_only:
        return {
            pkg.name: {
                'containers': pkg.containers,
                'sequences': pkg.sequences,
                'actions': pkg.actions,
                'boards': [board.as_posix() for board in pkg.boards],
                'name': pkg.name,
                'description': pkg.description,
                'author': pkg.author,
                'category': pkg.category,
                'hide_boards': pkg.hide_boards
            } for pkg in Package.pool.values()}
    else:
        return list(Package.pool.keys())


@projects_router.get('/sequence-types/')
async def project_sequence_types_api(only_tracked: Optional[bool] = False,
                                     packages=Depends(load_active_packages)):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    if only_tracked:
        return project.repo.tracked_sequence_types()
    else:
        return project.repo.registered_sequence_types()


@projects_router.get('/container-types/')
async def project_container_types_api(only_tracked: Optional[bool] = False,
                                      packages=Depends(load_active_packages)):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    if only_tracked:
        return project.repo.tracked_container_types()
    else:
        return project.repo.registered_container_types()


@projects_router.get('/actions/')
async def project_actions_api(packages=Depends(load_active_packages)):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    return project.repo.registered_actions()


@projects_router.get('/status/')
async def project_status_api():
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    return 'OK'
