import json

from aim.web.api.dashboard_apps.models import ExploreState
from aim.web.api.dashboard_apps.pydantic_models import (
    ExploreStateCreateIn,
    ExploreStateGetOut,
    ExploreStateListOut,
    ExploreStateUpdateIn,
)
from aim.web.api.dashboard_apps.serializers import explore_state_response_serializer
from aim.web.api.db import get_session
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session


dashboard_apps_router = APIRouter()


@dashboard_apps_router.get('/', response_model=ExploreStateListOut)
async def dashboard_apps_list_api(session: Session = Depends(get_session)):
    explore_states = session.query(ExploreState).filter(ExploreState.is_archived == False)  # noqa
    result = []
    for es in explore_states:
        result.append(explore_state_response_serializer(es))
    return result


@dashboard_apps_router.post('/', status_code=201, response_model=ExploreStateGetOut)
async def dashboard_apps_create_api(explore_state_in: ExploreStateCreateIn, session: Session = Depends(get_session)):
    explore_state = ExploreState()
    explore_state.type = explore_state_in.type
    explore_state.state = json.dumps(explore_state_in.state)

    session.add(explore_state)
    session.commit()

    return explore_state_response_serializer(explore_state)


@dashboard_apps_router.get('/{app_id}/', response_model=ExploreStateGetOut)
async def dashboard_apps_get_api(app_id: str, session: Session = Depends(get_session)):
    explore_state = (
        session.query(ExploreState).filter(ExploreState.uuid == app_id, ExploreState.is_archived == False).first()  # noqa: E712
    )
    if not explore_state:
        raise HTTPException(status_code=404)

    return explore_state_response_serializer(explore_state)


@dashboard_apps_router.put('/{app_id}/', response_model=ExploreStateGetOut)
async def dashboard_apps_put_api(
    app_id: str, explore_state_in: ExploreStateUpdateIn, session: Session = Depends(get_session)
):
    explore_state = (
        session.query(ExploreState).filter(ExploreState.uuid == app_id, ExploreState.is_archived == False).first()  # noqa: E712
    )
    if not explore_state:
        raise HTTPException(status_code=404)

    if explore_state_in.type:
        explore_state.type = explore_state_in.type
    if explore_state_in.state:
        explore_state.state = json.dumps(explore_state_in.state)

    session.commit()

    return explore_state_response_serializer(explore_state)


@dashboard_apps_router.delete('/{app_id}/')
async def dashboard_apps_delete_api(app_id: str, session: Session = Depends(get_session)):
    explore_state = (
        session.query(ExploreState).filter(ExploreState.uuid == app_id, ExploreState.is_archived == False).first()  # noqa: E712
    )
    if not explore_state:
        raise HTTPException(status_code=404)

    explore_state.is_archived = True
    session.commit()
