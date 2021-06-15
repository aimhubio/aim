from aim.web.app.dashboards.models import Dashboard
from aim.web.app.dashboard_apps.models import ExploreState


def dashboard_response_serializer(dashboard_object):
    if not isinstance(dashboard_object, Dashboard):
        return None

    app = ExploreState.query.filter(ExploreState.dashboard_id == dashboard_object.uuid,
                                    ExploreState.is_archived == False).first()

    response = {
        'id': dashboard_object.uuid,
        'name': dashboard_object.name,
        'description': dashboard_object.description,
        'app_id': app.uuid if app else None,
        'updated_at': dashboard_object.updated_at,
        'created_at': dashboard_object.created_at
    }

    return response
