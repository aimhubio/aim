from fastapi import Depends,HTTPException, Request
from aim.web.app.utils import APIRouter  # wrapper for fastapi.APIRouter
from sqlalchemy.orm import joinedload, Session

from aim.web.app.db import get_session
from aim.web.app.commits.models import Tag

tags_router = APIRouter()


@tags_router.get('/list/')
async def tags_list_api(session: Session = Depends(get_session)):
    tags = session.query(Tag).filter(Tag.is_hidden.isnot(True)) \
        .order_by(Tag.created_at.desc()).all()

    result = []
    for t in tags:
        result.append({
            'id': t.uuid,
            'name': t.name,
            'color': t.color,
            'num_commits': len(t.commits),
        })

    return result


@tags_router.post('/new/')
async def tags_create_api(request: Request, session: Session = Depends(get_session)):
    command_form = await request.form()

    name = command_form.get('name') or ''
    name = name.strip()

    color = command_form.get('color') or ''
    color = color.strip()

    if not name or not color:
        raise HTTPException(status_code=403)

    t = Tag(name, color)
    session.add(t)
    session.commit()

    return {
        'id': t.uuid,
    }


@tags_router.post('/update/')
async def tag_update_api(request: Request, session: Session = Depends(get_session)):
    command_form = await request.form()

    uuid = command_form.get('id') or ''
    uuid = uuid.strip()

    tag = session.query(Tag).filter_by(uuid=uuid).first()
    if not tag:
        raise HTTPException(status_code=404)

    if 'name' in command_form:
        tag.name = command_form.get('name').strip()
        if not tag.name:
            raise HTTPException(status_code=403)
    if 'color' in command_form:
        tag.color = command_form.get('color').strip()
        if not tag.color:
            raise HTTPException(status_code=403)
    if 'is_hidden' in command_form:
        tag.is_hidden = command_form.get('is_hidden') == 'true'

    session.commit()

    return {
        'id': tag.uuid,
    }


@tags_router.get('/runs/{tag_id}/')
async def tag_get_related_runs(tag_id: str, session: Session = Depends(get_session)):
    tag = session.query(Tag).options(joinedload('commits')) \
        .filter_by(uuid=tag_id) \
        .first()

    related_runs = []
    if tag:
        for commit in tag.commits:
            related_runs.append({
                'hash': commit.hash,
                'experiment_name': commit.experiment_name,
                'uuid': commit.uuid,
                'created_at': commit.created_at,
            })

    return {
        'data': related_runs,
    }


@tags_router.get('/{tag_id}/')
async def tag_get_api(tag_id: str, session: Session = Depends(get_session)):
    tag = session.query(Tag).filter_by(uuid=tag_id).first()

    if not tag:
        raise HTTPException(status_code=404)

    return {
        'name': tag.name,
        'color': tag.color,
        'is_hidden': tag.is_hidden,
    }
