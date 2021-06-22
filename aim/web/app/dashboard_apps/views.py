import json
from flask import Blueprint, jsonify, request, make_response
from flask_restful import Api, Resource

from aim.web.app.dashboard_apps.models import ExploreState
from aim.web.app.dashboard_apps.serializers import ExploreStateModelSerializer, explore_state_response_serializer
from aim.web.app.db import get_session

dashboard_apps_bp = Blueprint('dashboard_apps', __name__)
dashboard_apps_api = Api(dashboard_apps_bp)


@dashboard_apps_api.resource('/')
class DashboardAppsListCreateApi(Resource):
    def get(self):
        with get_session() as session:
            explore_states = session.query(ExploreState).filter(ExploreState.is_archived == False)
            result = []
            for es in explore_states:
                result.append(explore_state_response_serializer(es))
        return make_response(jsonify(result), 200)

    def post(self):
        with get_session() as session:
            explore_state = ExploreState()
            serializer = ExploreStateModelSerializer(model_instance=explore_state, json_data=json.loads(request.data))
            serializer.validate()
            if serializer.error_messages:
                return make_response(jsonify(serializer.error_messages), 403)
            explore_state = serializer.save()
            session.add(explore_state)
            session.commit()
        return make_response(jsonify(explore_state_response_serializer(explore_state)), 201)


@dashboard_apps_api.resource('/<app_id>')
class DashboardAppsGetPutDeleteApi(Resource):
    def get(self, app_id):
        with get_session() as session:
            explore_state = session.query(ExploreState)\
                .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False)\
                .first()
            if not explore_state:
                return make_response(jsonify({}), 404)

        return make_response(jsonify(explore_state_response_serializer(explore_state)), 200)

    def put(self, app_id):
        with get_session() as session:
            explore_state = session(ExploreState).query\
                .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False)\
                .first()
            if not explore_state:
                return make_response(jsonify({}), 404)

            serializer = ExploreStateModelSerializer(model_instance=explore_state, json_data=json.loads(request.data))
            serializer.validate()
            if serializer.error_messages:
                return make_response(jsonify(serializer.error_messages), 403)

            explore_state = serializer.save()
            session.add(explore_state)

            session.commit()

        return make_response(jsonify(explore_state_response_serializer(explore_state)), 200)

    def delete(self, app_id):
        with get_session() as session:
            explore_state = session.query(ExploreState)\
                .filter(ExploreState.uuid == app_id, ExploreState.is_archived == False)\
                .first()
            if not explore_state:
                return make_response(jsonify({}), 404)

            explore_state.is_archived = True
            session.commit()

        return make_response(jsonify({}), 200)
