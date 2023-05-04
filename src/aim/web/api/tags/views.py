from fastapi import HTTPException, Depends
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from typing import Optional

from aim.web.api.projects.project import Project
from aim.web.api.utils import object_factory
from aim.web.api.tags.pydantic_models import (
    TagCreateIn,
    TagUpdateIn,
    TagUpdateOut,
    TagGetOut,
    TagListOut,
    TagGetRunsOut,
)
tags_router = APIRouter()


@tags_router.get('/', response_model=TagListOut)
async def get_tags_list_api(factory=Depends(object_factory)):
    return [{'id': tag.uuid,
             'name': tag.name,
             'color': tag.color,
             'description': tag.description,
             'run_count': len(tag.runs),
             'archived': tag.archived}
            for tag in factory.tags()]


@tags_router.get('/search/', response_model=TagListOut)
async def search_tags_by_name_api(q: Optional[str] = '', factory=Depends(object_factory)):
    return [{'id': tag.uuid,
             'name': tag.name,
             'color': tag.color,
             'description'
             'run_count': len(tag.runs),
             'archived': tag.archived}
            for tag in factory.search_tags(q.strip())]


@tags_router.post('/', response_model=TagUpdateOut)
async def create_tag_api(tag_in: TagCreateIn, factory=Depends(object_factory)):
    with factory:
        try:
            tag = factory.create_tag(tag_in.name.strip())
            if tag_in.color is not None:
                tag.color = tag_in.color.strip()
            if tag_in.description is not None:
                tag.description = tag_in.description.strip()
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {
        'id': tag.uuid,
        'status': 'OK'
    }


@tags_router.get('/{tag_id}/', response_model=TagGetOut)
async def get_tag_api(tag_id: str, factory=Depends(object_factory)):
    tag = factory.find_tag(tag_id)
    if not tag:
        raise HTTPException(status_code=404)

    response = {
        'id': tag.uuid,
        'name': tag.name,
        'color': tag.color,
        'description': tag.description,
        'archived': tag.archived,
        'run_count': len(tag.runs)
    }
    return response


@tags_router.put('/{tag_id}/', response_model=TagUpdateOut)
async def update_tag_properties_api(tag_id: str, tag_in: TagUpdateIn, factory=Depends(object_factory)):
    with factory:
        tag = factory.find_tag(tag_id)
        if not tag:
            raise HTTPException(status_code=404)

        if tag_in.name:
            tag.name = tag_in.name.strip()
        if tag_in.color is not None:
            tag.color = tag_in.color.strip()
        if tag_in.description is not None:
            tag.description = tag_in.description.strip()
        if tag_in.archived is not None:
            tag.archived = tag_in.archived

    return {
        'id': tag.uuid,
        'status': 'OK'
    }


@tags_router.delete('/{tag_id}/')
async def delete_tag_api(tag_id: str, factory=Depends(object_factory)):
    with factory:
        if not factory.delete_tag(tag_id):
            raise HTTPException(status_code=404)


@tags_router.get('/{tag_id}/runs/', response_model=TagGetRunsOut)
async def get_tagged_runs_api(tag_id: str, factory=Depends(object_factory)):
    project = Project()

    tag = factory.find_tag(tag_id)
    if not tag:
        raise HTTPException(status_code=404)

    from aim.sdk.run import Run

    cache_name = 'tag_runs'
    project.repo.run_props_cache_hint = cache_name
    project.repo.structured_db.invalidate_cache(cache_name)
    project.repo.structured_db.init_cache(cache_name, tag.get_runs, lambda run_: run_.hash)

    tag_runs = []
    for tagged_run in tag.runs:
        run = Run(tagged_run.hash, repo=project.repo, read_only=True)
        tag_runs.append({
            'run_id': tagged_run.hash,
            'name': tagged_run.name,
            'creation_time': run.creation_time,
            'end_time': run.end_time,
            'experiment': tagged_run.experiment if tagged_run.experiment else None
        })

    project.repo.structured_db.invalidate_cache(cache_name)
    project.repo.run_props_cache_hint = None

    response = {
        'id': tag.uuid,
        'runs': tag_runs
    }
    return response
