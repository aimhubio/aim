import os
from pathlib import Path

from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from fastapi.responses import FileResponse
from fastapi import HTTPException

statics_router = APIRouter()


@statics_router.get('/static-files/{path:path}/')
async def serve_static_files(path):
    from aim import web
    static_files_root = os.path.join(os.path.dirname(web.__file__), 'ui', 'build')
    static_file_name = '/'.join((static_files_root, path))

    # check if path is leading inside ui/build directory
    if not Path(static_files_root) in Path(static_file_name).resolve().parents:
        raise HTTPException(404)

    compressed_file_name = '{}.gz'.format(static_file_name)
    if os.path.exists(compressed_file_name):
        return FileResponse(compressed_file_name, headers={'Content-Encoding': 'gzip'})
    return FileResponse(static_file_name)


# do not change the placement of this method
# as it also serves as a fallback for wrong url routes
@statics_router.get('/{path:path}/')
async def serve_index_html():
    from aim import web
    static_file_name = os.path.join(os.path.dirname(web.__file__), 'ui', 'build', 'index.html')
    compressed_file_name = '{}.gz'.format(static_file_name)
    if os.path.exists(compressed_file_name):
        return FileResponse(compressed_file_name, headers={'Content-Encoding': 'gzip'})
    return FileResponse(static_file_name)
