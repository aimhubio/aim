import os
from pathlib import Path

from fastapi import HTTPException, Request
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.templating import Jinja2Templates

from aim.web.configs import AIM_UI_BASE_PATH
statics_router = APIRouter()


@statics_router.get('/static-files/{path:path}/')
async def serve_static_files(path):
    from aim import web
    static_files_root = os.path.join(os.path.dirname(web.__file__), 'ui', 'build')
    static_file_name = '/'.join((static_files_root, path))

    # check if path is leading inside ui/build directory
    if not Path(static_files_root).resolve() in Path(static_file_name).resolve().parents:
        raise HTTPException(status_code=404)

    compressed_file_name = '{}.gz'.format(static_file_name)
    if os.path.exists(compressed_file_name):
        return FileResponse(compressed_file_name, headers={'Content-Encoding': 'gzip'})
    return FileResponse(static_file_name)


# do not change the placement of this method
# as it also serves as a fallback for wrong url routes
@statics_router.get('/{path:path}/', response_class=HTMLResponse)
async def serve_index_html(request: Request):
    from aim import web
    template_files_dir = os.path.join(os.path.dirname(web.__file__), 'ui', 'build')
    templates = Jinja2Templates(directory=template_files_dir)
    base_path = os.environ.get(AIM_UI_BASE_PATH, '')

    return templates.TemplateResponse('index-template.html', {'request': request, 'base_path': base_path})
