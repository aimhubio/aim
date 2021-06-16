import os
from urllib import parse

from flask import Flask, redirect, request, make_response
from flask_cors import CORS

from aim.engine.configs import AIM_FLASK_ENV_KEY
from aim.engine.types import Singleton
from aim.web.app.config import config
from aim.web.app.db import Db


class App(metaclass=Singleton):
    api = None
    executables_manager = None

    @classmethod
    def __init__(cls, test_config=None):
        api = Flask(__name__, static_folder=os.path.join('ui', 'build'))
        api.url_map.strict_slashes = False

        @api.before_request
        def clear_trailing():
            rp = request.path
            if rp != '/' and rp.endswith('/'):
                return redirect(rp.rstrip('/'))

        @api.before_request
        def set_timezone():
            tz = request.cookies.get('__AIMDE__:TIMEZONE')
            if tz:
                request.tz = parse.unquote(tz)
            else:
                # Set default timezone to GMT
                request.tz = 'gmt'

        CORS(api,
             origins='*',
             methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
             allow_headers=['Origin', 'X-Requested-With',
                            'Content-Type', 'Accept', 'Authorization'],
             supports_credentials=True,
             max_age=86400,
             vary_header=True)

        # check environment variables to see which config to load
        env = os.environ.get(AIM_FLASK_ENV_KEY, 'prod')

        # load config
        if test_config:
            api.config.from_mapping(**test_config)
        else:
            api.config.from_object(config[env])

        Db(api)

        # import and register blueprints
        from aim.web.app.views import general_bp, serve_wrong_urls
        from aim.web.app.commits.views import commits_bp
        from aim.web.app.dashboard_apps.views import dashboard_apps_bp
        from aim.web.app.dashboards.views import dashboards_bp
        from aim.web.app.projects.views import projects_bp
        from aim.web.app.tags.views import tags_bp

        api.register_blueprint(general_bp)
        api.register_blueprint(commits_bp, url_prefix='/api/v1/commits')
        api.register_blueprint(dashboard_apps_bp, url_prefix='/api/v1/apps')
        api.register_blueprint(dashboards_bp, url_prefix='/api/v1/dashboards')
        api.register_blueprint(projects_bp, url_prefix='/api/v1/projects')
        api.register_blueprint(tags_bp, url_prefix='/api/v1/tags')
        api.register_error_handler(404, serve_wrong_urls)

        cls.api = api
