from fastapi import HTTPException, Depends
from typing import List, Optional

from aim.web.api.utils import APIRouter
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
    return [{'id': tag.uuid, 'name': tag.name, 'color': tag.color, 'run_count': len(tag.runs), 'archived': tag.archived}
            for tag in factory.tags()]


@tags_router.get('/search/', response_model=TagListOut)
async def search_tags_by_name_api(q: Optional[str] = '', factory=Depends(object_factory)):
    return [{'id': tag.uuid, 'name': tag.name, 'color': tag.color, 'run_count': len(tag.runs), 'archived': tag.archived}
            for tag in factory.search_tags(q.strip())]


@tags_router.post('/', response_model=TagUpdateOut)
async def create_tag_api(tag_in: TagCreateIn, factory=Depends(object_factory)):
    with factory:
        try:
            tag = factory.create_tag(tag_in.name.strip())
            if tag_in.color is not None:
                tag.color = tag_in.color.strip()
        except ValueError as e:
            raise HTTPException(400, detail=str(e))

    return {
        'id': tag.uuid,
        'status': 'OK'
    }


@tags_router.get('/{tag_id}/', response_model=TagGetOut)
async def get_tag_api(tag_id: str, factory=Depends(object_factory)):
    tag = factory.find_tag(tag_id)
    if not tag:
        raise HTTPException

    response = {
        'id': tag.uuid,
        'name': tag.name,
        'color': tag.color,
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
        if tag_in.color:
            tag.color = tag_in.color.strip()
        if tag_in.archive is not None:
            tag.archived = tag_in.archive

    return {
        'id': tag.uuid,
        'status': 'OK'
    }


@tags_router.get('/{tag_id}/runs/', response_model=TagGetRunsOut)
async def get_tagged_runs_api(tag_id: str, factory=Depends(object_factory)):
    tag = factory.find_tag(tag_id)
    if not tag:
        raise HTTPException

    response = {
        'id': tag.uuid,
        'runs': [{'run_id': run.hashname, 'name': run.name} for run in tag.runs]
    }
    return response
