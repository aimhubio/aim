from fastapi import Depends, HTTPException, Request
from aim.web.api.utils import APIRouter  # wrapper for fastapi.APIRouter
from sqlalchemy.orm import Session

from aim.web.api.dashboards.models import Dashboard
from aim.web.api.dashboard_apps.models import ExploreState
from aim.web.api.dashboards.serializers import dashboard_response_serializer
from aim.web.api.db import get_session

dashboards_router = APIRouter()


@dashboards_router.get('/')
async def dashboards_list_api(session: Session = Depends(get_session)):
    dashboards_query = session.query(Dashboard) \
        .filter(Dashboard.is_archived == False) \
        .order_by(Dashboard.updated_at)  # noqa
    result = []

    for dashboard in dashboards_query:
        result.append(dashboard_response_serializer(dashboard, session))

    return result


@dashboards_router.post('/', status_code=201)
async def dashboards_post_api(request: Request, session: Session = Depends(get_session)):
    # create the dashboard object
    request_data = await request.json()
    dashboard_name = request_data.get('name')
    dashboard_description = request_data.get('description')
    dashboard = Dashboard(dashboard_name, dashboard_description)
    session.add(dashboard)

    # update the app object's foreign key relation
    app_id = request_data.get('app_id')
    app = session.query(ExploreState).filter(ExploreState.uuid == app_id).first()
    if app:
        app.dashboard_id = dashboard.uuid

    # commit db session
    session.commit()

    return dashboard_response_serializer(dashboard, session)


@dashboards_router.get('/{dashboard_id}/')
async def dashboards_get_api(dashboard_id: str, session: Session = Depends(get_session)):
    dashboard = session.query(Dashboard) \
        .filter(Dashboard.uuid == dashboard_id, Dashboard.is_archived == False) \
        .first()  # noqa
    if not dashboard:
        raise HTTPException(status_code=404)

    return dashboard_response_serializer(dashboard, session)


@dashboards_router.put('/{dashboard_id}/')
async def dashboards_put_api(dashboard_id: str, request: Request, session: Session = Depends(get_session)):
    dashboard = session.query(Dashboard) \
        .filter(Dashboard.uuid == dashboard_id, Dashboard.is_archived == False) \
        .first()  # noqa
    if not dashboard:
        raise HTTPException(status_code=404)
    request_data = await request.json()
    dashboard_name = request_data.get('name')
    if dashboard_name:
        dashboard.name = dashboard_name
    dashboard_description = request_data.get('description')
    if dashboard_description:
        dashboard.description = dashboard_description
    session.commit()

    return dashboard_response_serializer(dashboard, session)


@dashboards_router.delete('/{dashboard_id}/')
async def dashboards_delete_api(dashboard_id: str, session: Session = Depends(get_session)):
    dashboard = session.query(Dashboard) \
        .filter(Dashboard.uuid == dashboard_id, Dashboard.is_archived == False) \
        .first()  # noqa
    if not dashboard:
        raise HTTPException(status_code=404)

    dashboard.is_archived = True
    session.commit()
