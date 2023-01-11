import datetime
import pytz

from fastapi import HTTPException


def object_factory():
    from aim.web.api.projects.project import Project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    return project.repo.structured_db


def datetime_now():
    return datetime.datetime.utcnow().replace(tzinfo=pytz.utc)
