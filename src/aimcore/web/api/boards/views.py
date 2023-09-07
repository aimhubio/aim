from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from aimcore.web.utils import get_root_package, get_root_package_name, get_package_by_name
from aimcore.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter

from aimcore.web.api.boards.pydantic_models import BoardOut, BoardListOut
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    import pathlib

boards_router = APIRouter()


@boards_router.get('/', response_model=BoardOut)
async def board_list_api(package=Depends(get_root_package)):
    if package is None:
        raise HTTPException(status_code=400, detail=f'Failed to load current active '
                                                    f'package \'{get_root_package_name()}\'.')
    result = [board.as_posix() for board in package.boards]
    return JSONResponse(result)


@boards_router.get('/{board_path:path}', response_model=BoardListOut)
async def board_get_api(board_path: str, package=Depends(get_root_package)):
    if ':' in board_path:
        package_name, board_path = board_path.split(':', maxsplit=1)
        try:
            package = get_package_by_name(package_name)
        except AssertionError:
            raise HTTPException(status_code=400, detail=f'\'{package_name}\' is not valid package.')

    if package is None:
        raise HTTPException(status_code=400, detail=f'Failed to load current active '
                                                    f'package \'{get_root_package_name()}\'.')
    board: pathlib.Path = package.boards_directory / board_path
    if not board.exists():
        raise HTTPException(status_code=404)
    if not board.is_file():
        raise HTTPException(status_code=400, detail=f'\'{board_path}\' is not valid board.')

    result = {
        'path': board_path
    }
    with board.open(mode='r') as fh:
        result['code'] = fh.read()
    return JSONResponse(result)
