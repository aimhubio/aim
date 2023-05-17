from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from sqlalchemy.orm import Session

from aim.web.api.boards.models import Board, BoardTemplate
from aim.web.api.boards.pydantic_models import (
    CreateBoardIn,
    UpdateBoardIn,
    BoardTemplateListOut,
    BoardTemplateOut,
    BoardListOut,
    BoardOut
)

from aim.web.api.db import get_session

boards_router = APIRouter()


def _update_board_templates_from_packages(session):
    db_board_templates = {(t.package, t.name): t for t in session.query(BoardTemplate)}

    from aim.sdk.core.package_utils import Package

    for package_name, package in Package.pool.items():
        for board_name, board_info in package.board_templates.items():
            if (package_name, board_name) not in db_board_templates:
                new_board_template = BoardTemplate(package_name, board_name)
                new_board_template.code = board_info[0]
                session.add(new_board_template)
            else:
                board_template = db_board_templates[package_name, board_name]
                if board_template.checksum != board_info[1]:
                    print(board_template.checksum)
                    print(board_info[0])
                    board_template.code = board_info[0]
                    session.add(board_template)
    session.commit()


@boards_router.get('/templates', response_model=BoardTemplateListOut)
async def board_template_list_api(package_name: Optional[str] = None, session: Session = Depends(get_session)):
    _update_board_templates_from_packages(session)
    if package_name is not None:
        templates = session.query(BoardTemplate).filter(BoardTemplate.package == package_name)
    else:
        templates = session.query(BoardTemplate)
    result = []
    for board_template in templates:
        result.append({
            'template_id': board_template.id,
            'package': board_template.package,
            'version': board_template.package_version,
            'name': board_template.name,
            'description': board_template.description
        })
    return JSONResponse(result)


@boards_router.get('/templates/{template_id}', response_model=BoardTemplateOut)
async def board_template_get_api(template_id: str, session: Session = Depends(get_session)):
    board_template = session.query(BoardTemplate).filter(BoardTemplate.id == template_id).first()
    if not board_template:
        raise HTTPException(status_code=404)

    result = {
        'template_id': board_template.id,
        'name': board_template.name,
        'description': board_template.description,
        'code': board_template.code,
        'package': board_template.package,
        'version': board_template.package_version
    }

    return JSONResponse(result)


@boards_router.get('/', response_model=BoardListOut)
async def board_list_api(session: Session = Depends(get_session)):
    boards = session.query(Board).filter(Board.is_archived == False)  # noqa
    result = []
    for board in boards:
        result.append({
            'board_id': board.id,
            'name': board.name,
            'description': board.description,
            'template_id': board.template_id
        })
    return JSONResponse(result)


@boards_router.get('/{board_id}', response_model=BoardOut)
async def board_get_api(board_id: str, session: Session = Depends(get_session)):
    board = session.query(Board).filter(Board.id == board_id).first()
    if not board_id:
        raise HTTPException(status_code=404)

    result = {
        'board_id': board.id,
        'name': board.name,
        'description': board.description,
        'code': board.code,
        'template_id': board.template_id,
        'is_from_template': board.is_from_template,
        'is_archived': board.is_archived,
    }
    return JSONResponse(result)


@boards_router.post('/', status_code=201, response_model=BoardOut)
async def board_create_api(board_in: CreateBoardIn, session: Session = Depends(get_session)):
    new_board = Board(name=board_in.name)
    new_board.description = board_in.description
    if board_in.from_template is not None:
        template = session.query(BoardTemplate).filter(BoardTemplate.id == board_in.from_template).first()
        if not template:
            raise HTTPException(404, detail=f'Missing board template {board_in.from_template}.')
        new_board.template_id = board_in.from_template
        new_board.code = template.code
    else:
        assert board_in.code
        new_board.code = board_in.code

    session.add(new_board)
    session.commit()

    result = {
        'board_id': new_board.id,
        'name': new_board.name,
        'description': new_board.description,
        'code': new_board.code,
        'template_id': new_board.template_id,
        'is_from_template': new_board.is_from_template,
        'is_archived': new_board.is_archived,
    }

    return JSONResponse(result)


@boards_router.put('/{board_id}/', response_model=BoardOut)
async def board_update_api(board_id: str, board_in: UpdateBoardIn, session: Session = Depends(get_session)):
    board = session.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404)

    if board_in.code is not None:
        board.code = board_in.code
    if board_in.name is not None:
        board.name = board_in.name
    if board_in.description is not None:
        board.description = board_in.description

    session.commit()

    result = {
        'board_id': board.id,
        'name': board.name,
        'description': board.description,
        'code': board.code,
        'template_id': board.template_id,
        'is_from_template': board.is_from_template,
        'is_archived': board.is_archived,
    }
    return JSONResponse(result)


@boards_router.post('/reset/{board_id}', response_model=BoardOut)
async def board_reset_api(board_id: str, session: Session = Depends(get_session)):
    board = session.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail='Board not found.')

    if not board.template:
        raise HTTPException(status_code=404, detail=f'Cannot reset board. '
                                                    f'Board {board_id} is not associated with any board template.')
    board.code = board.template.code

    session.commit()

    result = {
        'board_id': board.id,
        'name': board.name,
        'description': board.description,
        'code': board.code,
        'template_id': board.template_id,
        'is_from_template': board.is_from_template,
        'is_archived': board.is_archived,
    }
    return JSONResponse(result)


@boards_router.delete('/{board_id}/')
async def board_delete_api(board_id: str, session: Session = Depends(get_session)):
    board = session.query(Board).filter(Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404)

    board.is_archived = True
    session.commit()
