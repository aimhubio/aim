from fastapi import Request, HTTPException, Depends

from aim.web.api.utils import APIRouter
from aim.web.api.v2.helpers import object_factory

tags_router = APIRouter()


@tags_router.get('/')
async def get_tags_list_api(factory=Depends(object_factory)):
    return [{'id': tag.uuid, 'name': tag.name, 'color': tag.color, 'run_count': len(tag.runs)}
            for tag in factory.tags()]


@tags_router.get('/search/')
async def search_tags_by_name_api(request: Request, factory=Depends(object_factory)):
    params = request.query_params
    search_term = params.get('q') or ''
    search_term.strip()

    response = [{'id': tag.uuid, 'name': tag.name, 'color': tag.color, 'run_count': len(tag.runs)}
                for tag in factory.search_tags(search_term)]
    return response


@tags_router.post('/')
async def create_tag_api(request: Request, factory=Depends(object_factory)):
    body = await request.json()
    tag_name = body.get('name') or ''
    if not tag_name:
        raise HTTPException(400)
    with factory:
        try:
            tag = factory.create_tag(tag_name)
        except ValueError as e:
            raise HTTPException(400, detail=str(e))

    return {
        'id': tag.uuid,
        'status': 'OK'
    }

@tags_router.get('/{tag_id}/')
async def get_tag_api(tag_id: str, factory=Depends(object_factory)):
    tag = factory.find_tag(tag_id)
    if not tag:
        raise HTTPException

    response = {
        'id': tag.uuid,
        'name': tag.name,
        'color': tag.color,
    }
    return response

@tags_router.put('/{tag_id}/')
async def update_tag_properties_api(tag_id: str, request: Request, factory=Depends(object_factory)):
    with factory:
        tag = factory.find_tag(tag_id)
        if not tag:
            raise HTTPException(status_code=404)
        body = await request.json()
        tag_name = body.get('name') or ''
        tag_name = tag_name.strip()
        tag_color = body.get('color') or ''
        tag_color = tag_color.strip()
        if tag_name:
            tag.name = tag_name
        if tag_color:
            tag.color = tag_color

    return {
        'id': tag.uuid,
        'status': 'OK'
    }

@tags_router.get('/{tag_id}/runs/')
async def get_tagged_runs_api(tag_id: str, factory=Depends(object_factory)):
    tag = factory.find_tag(tag_id)
    if not tag:
        raise HTTPException

    response = {
        'id': tag.uuid,
        'runs': [{'run_id': run.hash, 'name': run.name} for run in tag.runs]
    }
    return response