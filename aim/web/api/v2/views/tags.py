from fastapi import HTTPException, Request

from aim.web.api.utils import APIRouter
from aim.web.api.projects.project import Project
from aim.storage.run_metadata.models import Tag, Run

tag_router = APIRouter()


@tag_router.get('/list/')
async def get_tags_list_api():
    pass


@tag_router.get('/search/')
async def search_runs_by_name_api(request: Request):
    pass


@tag_router.get('/{tag_id}/')
async def get_tag_api(tag_id: str):
    pass


@tag_router.get('/{tag_id}/runs/')
async def get_tagged_runs_api(tag_id: str):
    pass


@tag_router.post('/new/')
async def create_tag_api():
    pass


@tag_router.post('/{tag_id}/')
async def update_tag_properties_api(tag_id: str, request: Request):
    pass


