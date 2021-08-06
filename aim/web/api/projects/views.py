import os
import pytz

from collections import Counter
from datetime import datetime
from fastapi import Depends, HTTPException, Request
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter

from urllib import parse

from aim.engine.configs import AIM_UI_TELEMETRY_KEY
from aim.web.api.projects.project import Project
from aim.web.api.v2.helpers import object_factory

projects_router = APIRouter()


@projects_router.get('/')
async def project_api():
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    return {
        'name': project.name,
        'path': project.path,
        'tf_enabled': project.tf_enabled,
        'description': project.description,
        'branches': project.repo.list_branches(),
        'telemetry_enabled': os.getenv(AIM_UI_TELEMETRY_KEY, '1'),
    }


@projects_router.get('/activity/')
async def project_activity_api(request: Request, factory=Depends(object_factory)):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    try:
        timezone = request.cookies.get('__AIMDE__:TIMEZONE')
        if timezone:
            timezone = pytz.timezone(parse.unquote(timezone))
    except:
        timezone = None
    if not timezone:
        timezone = pytz.timezone('gmt')

    num_runs = 0
    activity_counter = Counter()
    for run in project.repo.iter_runs():
        creation_timestamp = run.creation_time if run.creation_time > 0 else 0
        activity_counter[datetime.fromtimestamp(creation_timestamp, timezone).strftime('%Y-%m-%d')] += 1
        num_runs += 1

    return {
        'num_experiments': len(factory.experiments),
        'num_runs': num_runs,
        'activity_map': dict(activity_counter),
    }


@projects_router.get('/params/')
async def project_params_api():
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    return {
        'params': project.repo.collect_params(),
        'metrics': project.repo.collect_metrics(),
    }
