import json

from flask import Blueprint, jsonify, request, make_response
from flask_restful import Api, Resource

from aim.web.app.dashboards.models import Dashboard
from aim.web.app.dashboard_apps.models import ExploreState
from aim.web.app.dashboards.serializers import dashboard_response_serializer
from aim.web.app.db import get_session

dashboards_bp = Blueprint('dashboards', __name__)
dashboards_api = Api(dashboards_bp)


@dashboards_api.resource('/')
class DashboardsListCreateApi(Resource):
    def get(self):
        with get_session() as session:
            dashboards_query = session.query(Dashboard)\
                .filter(Dashboard.is_archived == False)\
                .order_by(Dashboard.updated_at)
            result = []

            for dashboard in dashboards_query:
                result.append(dashboard_response_serializer(dashboard, session))
        return make_response(jsonify(result), 200)

    def post(self):
        # create the dashboard object
        with get_session() as session:
            request_data = json.loads(request.data)
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

        return make_response(jsonify(dashboard_response_serializer(dashboard, session)), 201)


@dashboards_api.resource('/<dashboard_id>')
class DashboardsGetPutDeleteApi(Resource):
    def get(self, dashboard_id):
        with get_session() as session:
            dashboard = session.query(Dashboard)\
                .filter(Dashboard.uuid == dashboard_id, Dashboard.is_archived == False)\
                .first()
            if not dashboard:
                return make_response(jsonify({}), 404)

        return make_response(jsonify(dashboard_response_serializer(dashboard, session)), 200)

    def put(self, dashboard_id):
        with get_session() as session:
            dashboard = session.query(Dashboard)\
                .filter(Dashboard.uuid == dashboard_id, Dashboard.is_archived == False)\
                .first()
            if not dashboard:
                return make_response(jsonify({}), 404)
            request_data = json.loads(request.data)
            dashboard_name = request_data.get('name')
            if dashboard_name:
                dashboard.name = dashboard_name
            dashboard_description = request_data.get('description')
            if dashboard_description:
                dashboard.description = dashboard_description
            session.commit()

        return make_response(jsonify(dashboard_response_serializer(dashboard, session)), 200)

    def delete(self, dashboard_id):
        with get_session() as session:
            dashboard = session.query(Dashboard)\
                .filter(Dashboard.uuid == dashboard_id, Dashboard.is_archived == False)\
                .first()
            if not dashboard:
                return make_response(jsonify({}), 404)

            dashboard.is_archived = True
            session.commit()

        return make_response(jsonify({}), 200)

