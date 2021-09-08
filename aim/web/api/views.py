import os

from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from fastapi.responses import FileResponse

general_router = APIRouter()


@general_router.get('/static-files/{path:path}/')
async def serve_static_files(path):
    from aim import web
    static_file_name = os.path.join(os.path.dirname(web.__file__), 'ui_v2', 'build', path)
    compressed_file_name = '{}.gz'.format(static_file_name)
    if os.path.exists(compressed_file_name):
        return FileResponse(compressed_file_name, headers={'Content-Encoding': 'gzip'})
    return FileResponse(static_file_name)


# do not change the placement of this method
# as it also serves as a fallback for wrong url routes
@general_router.get('/{path:path}/')
async def serve_index_html():
    from aim import web
    static_file_name = os.path.join(os.path.dirname(web.__file__), 'ui_v2', 'build', 'index.html')
    compressed_file_name = '{}.gz'.format(static_file_name)
    if os.path.exists(compressed_file_name):
        return FileResponse(compressed_file_name, headers={'Content-Encoding': 'gzip'})
    return FileResponse(static_file_name)
