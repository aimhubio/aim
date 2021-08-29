from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from sqlalchemy.orm import Session
from typing import List

from aim.web.api.dashboard_apps.models import ExploreState
from aim.web.api.dashboard_apps.pydantic_models import ExploreStateOut
from aim.web.api.dashboard_apps.serializers import ExploreStateModelSerializer, explore_state_response_serializer
from aim.web.api.db import get_session

dashboard_apps_router = APIRouter()


@dashboard_apps_router.get('/', response_model=List[ExploreStateOut])
async def dashboard_apps_list_api(session: Session = Depends(get_session)):
    explore_states = session.query(ExploreState).filter(ExploreState.is_archived == False)  # noqa
    result = []
    for es in explore_states:
        result.append(explore_state_response_serializer(es))
    return result


# TODO: [MV] find out a way to avoid double validation and use pydantic models for request validation instead
@dashboard_apps_router.post('/', status_code=201, response_model=ExploreStateOut)
async def dashboard_apps_create_api(request: Request, session: Session = Depends(get_session)):
    """
        Use response model's app_state as an example for request body \n
        Note: every field is optional
    """
    explore_state = ExploreState()
    request_data = await request.json()
    serializer = ExploreStateModelSerializer(model_instance=explore_state, json_data=request_data)
    serializer.validate()
    if serializer.error_messages:
        return JSONResponse(content=serializer.error_messages, status_code=403)
    explore_state = serializer.save()
    session.add(explore_state)
    session.commit()

    return explore_state_response_serializer(explore_state)


@dashboard_apps_router.get('/{app_id}/', response_model=ExploreStateOut)
async def dashboard_apps_get_api(app_id: str, session: Session = Depends(get_session)):
    explore_state = session.query(ExploreState) \
        .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False) \
        .first()
    if not explore_state:
        raise HTTPException(status_code=404)

    return explore_state_response_serializer(explore_state)


@dashboard_apps_router.put('/{app_id}/', response_model=ExploreStateOut)
async def dashboard_apps_put_api(app_id: str, request: Request, session: Session = Depends(get_session)):
    """
        Use response model's app_state as an example for request body \n
        Note: every field is optional
    """
    explore_state = session.query(ExploreState) \
        .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False) \
        .first()
    if not explore_state:
        raise HTTPException(status_code=404)
    request_data = await request.json()
    serializer = ExploreStateModelSerializer(model_instance=explore_state, json_data=request_data)
    serializer.validate()
    if serializer.error_messages:
        return JSONResponse(content=serializer.error_messages, status_code=403)
    explore_state = serializer.save()
    session.add(explore_state)
    session.commit()

    return explore_state_response_serializer(explore_state)


@dashboard_apps_router.delete('/{app_id}/')
async def dashboard_apps_delete_api(app_id: str, session: Session = Depends(get_session)):
    explore_state = session.query(ExploreState) \
        .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False) \
        .first()  # noqa
    if not explore_state:
        raise HTTPException(status_code=404)

    explore_state.is_archived = True
    session.commit()
