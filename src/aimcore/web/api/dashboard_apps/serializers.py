import json
from aimcore.web.api.dashboard_apps.models import ExploreState


def explore_state_response_serializer(es_object):
    if not isinstance(es_object, ExploreState):
        return None

    response_schema = {
        'id': es_object.uuid,
        'type': es_object.type,
        'updated_at': es_object.updated_at,
        'created_at': es_object.created_at,
        'state': json.loads(es_object.state)
    }

    return response_schema
