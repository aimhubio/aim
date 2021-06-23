from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from aim.web.app.utils import APIRouter  # wrapper for fastapi.APIRouter

from aim.web.app.dashboard_apps.models import ExploreState
from aim.web.app.dashboard_apps.serializers import ExploreStateModelSerializer, explore_state_response_serializer
from aim.web.app.db import get_session

dashboard_apps_router = APIRouter()


@dashboard_apps_router.get('/')
async def dashboard_apps_list_api():
    with get_session() as session:
        explore_states = session.query(ExploreState).filter(ExploreState.is_archived == False)
        result = []
        for es in explore_states:
            result.append(explore_state_response_serializer(es))
    return result


@dashboard_apps_router.post('/', status_code=201)
async def dashboard_apps_create_api(request: Request):
    with get_session() as session:
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


@dashboard_apps_router.get('/{app_id}/')
async def dashboard_apps_get_api(app_id: str):
    with get_session() as session:
        explore_state = session.query(ExploreState) \
            .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False) \
            .first()  # noqa
        if not explore_state:
            raise HTTPException(status_code=404)

    return explore_state_response_serializer(explore_state)


@dashboard_apps_router.put('/{app_id}/')
async def dashboard_apps_put_api(app_id: str, request: Request):
    with get_session() as session:
        explore_state = session(ExploreState).query \
            .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False) \
            .first()  # noqa
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
async def dashboard_apps_delete_api(app_id:str):
    with get_session() as session:
        explore_state = session.query(ExploreState) \
            .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False) \
            .first()  # noqa
        if not explore_state:
            raise HTTPException(status_code=404)

        explore_state.is_archived = True
        session.commit()
