import os

from pathlib import Path

from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from aim.web.configs import AIM_UI_BASE_PATH
from fastapi import HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse


statics_router = APIRouter()


@statics_router.get('/static-files/{path:path}/')
async def serve_static_files(path):
    import aim_ui

    static_files_root = Path(aim_ui.__file__).parent / 'build'
    # Normalize to resolve any .. segments
    static_file_name = os.path.normpath(static_files_root / path)

    # Ensure that no paths outside the root directory are accessed by checking that the
    # root directory is a prefix of the file path
    common_prefix = Path(os.path.commonpath([static_files_root, static_file_name]))
    if common_prefix != static_files_root:
        raise HTTPException(status_code=404)

    compressed_file_name = Path(f'{static_file_name}.gz')
    if compressed_file_name.exists():
        return FileResponse(compressed_file_name, headers={'Content-Encoding': 'gzip'})
    return FileResponse(static_file_name)


# do not change the placement of this method
# as it also serves as a fallback for wrong url routes
@statics_router.get('/{path:path}/', response_class=HTMLResponse)
async def serve_index_html(request: Request):
    import aim_ui

    from jinja2 import Environment, FileSystemLoader

    template_files_dir = os.path.join(os.path.dirname(aim_ui.__file__), 'build')
    env = Environment(loader=FileSystemLoader(template_files_dir), autoescape=True)
    template = env.get_template('index-template.html')
    base_path = os.environ.get(AIM_UI_BASE_PATH, '')
    return template.render(base_path=base_path)
