import os
from datetime import timedelta
from typing import List, Optional, Tuple

from collections import Counter
from fastapi import Depends, HTTPException, Query, Header
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter

from aim.web.configs import AIM_UI_TELEMETRY_KEY, AIM_PROJECT_SETTINGS_FILE
from aim.web.api.projects.project import Project
from aim.web.api.projects.pydantic_models import (
    ProjectActivityApiOut,
    ProjectApiOut,
    ProjectParamsOut,
    ProjectPinnedMetricsApiOut,
    ProjectPinnedMetricsApiIn,
)
from aim.web.api.utils import object_factory
from aim.sdk.index_manager import RepoIndexManager

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
        'telemetry_enabled': os.getenv(AIM_UI_TELEMETRY_KEY, '1'),
    }


@projects_router.get('/activity/', response_model=ProjectActivityApiOut)
async def project_activity_api(x_timezone_offset: int = Header(default=0),
                               factory=Depends(object_factory)):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    num_runs = 0
    activity_counter = Counter()
    for run in factory.runs():
        creation_time = run.created_at - timedelta(minutes=x_timezone_offset)
        activity_counter[creation_time.strftime('%Y-%m-%dT%H:00:00')] += 1
        num_runs += 1

    return {
        'num_experiments': len(factory.experiments()),
        'num_runs': num_runs,
        'activity_map': dict(activity_counter),
    }


@projects_router.get('/pinned-metrics/',  response_model=ProjectPinnedMetricsApiOut)
async def get_pinned_metrics_api():
    import json
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    response = {'metrics': []}
    settings_filename = os.path.join(project.repo_path, AIM_PROJECT_SETTINGS_FILE)
    if not os.path.exists(settings_filename):
        return response

    with open(settings_filename, 'r') as settings_file:
        try:
            settings = json.load(settings_file)
        except json.decoder.JSONDecodeError:
            return response
        metrics_list = settings.get('pinned_metrics', [])
        response['metrics'] = metrics_list
        return response


@projects_router.post('/pinned-metrics/', response_model=ProjectPinnedMetricsApiOut)
async def update_pinned_metrics_api(request_data: ProjectPinnedMetricsApiIn):
    import json
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    metrics_list = request_data.metrics
    if not metrics_list:
        metrics_list = []

    # read current settings
    settings_filename = os.path.join(project.repo_path, AIM_PROJECT_SETTINGS_FILE)

    settings = {}
    if os.path.exists(settings_filename):
        with open(settings_filename, 'r') as settings_file:
            try:
                settings = json.load(settings_file)
            except json.decoder.JSONDecodeError:
                pass

    settings['pinned_metrics'] = metrics_list
    # dump new settings
    with open(settings_filename, 'w') as settings_file:
        json.dump(settings, settings_file)

    return {'metrics': metrics_list}


@projects_router.get('/params/', response_model=ProjectParamsOut, response_model_exclude_defaults=True)
async def project_params_api(sequence: Optional[Tuple[str, ...]] = Query(())):
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

    return RepoIndexManager.get_index_manager(project.repo.path).repo_status
