from fastapi import HTTPException

from aim.web.api.projects.project import Project


def object_factory():
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    return project.repo.structured_db
