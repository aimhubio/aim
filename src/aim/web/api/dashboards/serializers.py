from aim.web.api.dashboards.models import Dashboard
from aim.web.api.dashboard_apps.models import ExploreState


def dashboard_response_serializer(dashboard_object, session):
    if not isinstance(dashboard_object, Dashboard):
        return None

    app = session.query(ExploreState)\
        .filter(ExploreState.dashboard_id == dashboard_object.uuid, ExploreState.is_archived == False)\
        .first()

    response = {
        'id': dashboard_object.uuid,
        'name': dashboard_object.name,
        'description': dashboard_object.description,
        'app_id': app.uuid if app else None,
        'app_type': app.type if app else None,
        'updated_at': dashboard_object.updated_at,
        'created_at': dashboard_object.created_at
    }

    return response
