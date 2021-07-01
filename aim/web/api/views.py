import os

from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from fastapi.responses import FileResponse

from aim.web.api.projects.project import Project

general_router = APIRouter()


@general_router.get('/static-files/{path:path}/')
async def serve_static_files(path):
    from aim import web
    static_file_name = os.path.join(os.path.dirname(web.__file__), 'ui', 'build', path)
    compressed_file_name = '{}.gz'.format(static_file_name)
    if os.path.exists(compressed_file_name):
        return FileResponse(compressed_file_name, headers={'Content-Encoding': 'gzip'})
    return FileResponse(static_file_name)


@general_router.get('/static/{exp_name}/{commit_hash}/media/images/{path}/')
async def serve_images(exp_name, commit_hash, path):
    project = Project()
    image_file = os.path.join(project.repo_path,
                              exp_name, commit_hash,
                              'objects', 'media', 'images',
                              path)
    return FileResponse(image_file)


# do not change the placement of this method
# as it also serves as a fallback for wrong url routes
@general_router.get('/{path:path}/')
async def serve_index_html():
    from aim import web
    static_file_name = os.path.join(os.path.dirname(web.__file__), 'ui', 'build', 'index.html')
    compressed_file_name = '{}.gz'.format(static_file_name)
    if os.path.exists(compressed_file_name):
        return FileResponse(compressed_file_name, headers={'Content-Encoding': 'gzip'})
    return FileResponse(static_file_name)
