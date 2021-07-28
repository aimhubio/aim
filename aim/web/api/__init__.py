from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def create_app():
    app = FastAPI(title=__name__)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
        allow_headers=['Origin', 'X-Requested-With',
                       'Content-Type', 'Accept', 'Authorization'],
        allow_credentials=True,
        max_age=86400
    )
    from aim.web.api.commits.views import commits_router
    from aim.web.api.dashboard_apps.views import dashboard_apps_router
    from aim.web.api.dashboards.views import dashboards_router
    from aim.web.api.projects.views import projects_router
    from aim.web.api.tags.views import tags_router
    from aim.web.api.views import general_router

    # v2 API routes
    from aim.web.api.v2.views.runs import run_router
    from aim.web.api.v2.views.tags import tag_router
    from aim.web.api.v2.views.experiments import experiment_router

    app.include_router(run_router, prefix='/api/runs')
    app.include_router(tag_router, prefix='/api/tags')
    app.include_router(experiment_router, prefix='/api/experiments')

    app.include_router(commits_router, prefix='/api/v1/commits')
    app.include_router(dashboard_apps_router, prefix='/api/v1/apps')
    app.include_router(dashboards_router, prefix='/api/v1/dashboards')
    app.include_router(projects_router, prefix='/api/v1/projects')
    app.include_router(tags_router, prefix='/api/v1/tags')
    app.include_router(general_router)

    return app
