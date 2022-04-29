import os
from pathlib import Path

from fastapi import HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse

from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from aim.web.configs import AIM_UI_BASE_PATH

statics_router = APIRouter()


@statics_router.get('/static-files/{path:path}/')
async def serve_static_files(path):
    import aim_ui

    static_files_root = os.path.join(os.path.dirname(aim_ui.__file__), 'build')
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
    import aim_ui
    from jinja2 import Environment, FileSystemLoader

    template_files_dir = os.path.join(os.path.dirname(aim_ui.__file__), 'build')
    env = Environment(
        loader=FileSystemLoader(template_files_dir),
        autoescape=True
    )
    template = env.get_template('index-template.html')
    base_path = os.environ.get(AIM_UI_BASE_PATH, '')
    return template.render(base_path=base_path)
