import json
import os
import time
import copy
from collections import Counter
from datetime import datetime
import pytz

from fastapi import HTTPException
from aim.web.app.utils import APIRouter  # wrapper for fastapi.APIRouter
from fastapi.responses import FileResponse

from sqlalchemy import func

from aim.artifacts.metric import Metric as MetricArtifact
from aim.engine.configs import AIM_UI_TELEMETRY_KEY
from aim.web.app.db import get_session
from aim.web.app.utils import unsupported_float_type
from aim.web.app.projects.utils import (
    get_branch_commits,
    deep_merge,
    dump_dict_values,
    upgrade_runs_table,
)
from aim.web.app.projects.project import Project
from aim.web.app.commits.models import Commit

projects_router = APIRouter()


@projects_router.get('/')
async def project_api():
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    return {
        'name': project.name,
        'path': project.path,
        'tf_enabled': project.tf_enabled,
        'description': project.description,
        'branches': project.repo.list_branches(),
        'telemetry_enabled': os.getenv(AIM_UI_TELEMETRY_KEY, '1'),
    }


@projects_router.get('/info/')
async def project_data_api():
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    return {
        'branches': project.repo.list_branches(),
    }


@projects_router.get('/activity/')
async def project_activity_api():
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    with get_session() as session:
        last_synced_run = session\
            .query(func.max(Commit.session_started_at),
                   func.max(Commit.session_closed_at))\
            .first()
        last_synced_run_time = max(last_synced_run[0] or 0,
                                   last_synced_run[1] or 0)

        modified_runs = project.get_modified_runs(last_synced_run_time)
        upgrade_runs_table(project, modified_runs, session)

        all_runs = session\
            .query(Commit.hash,
                   Commit.experiment_name,
                   Commit.session_started_at)\
            .filter(Commit.session_started_at > 0)\
            .all()

        experiments = {r.experiment_name for r in all_runs}

        # todo: check this out
        # try:
        #     timezone = pytz.timezone(request.tz)
        # except:
        #     timezone = None
        # if not timezone:
        timezone = pytz.timezone('gmt')

        activity_counter = Counter([
            datetime.fromtimestamp(r.session_started_at, timezone)
                    .strftime('%Y-%m-%d')
            if r.session_started_at > 0 else 0
            for r in all_runs
        ])

    return {
        'num_experiments': len(experiments),
        'num_runs': len(all_runs),
        'activity_map': dict(activity_counter),
    }


@projects_router.get('/params/')
async def project_params_api():
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    repo = project.repo
    metrics = set()
    params = {}

    for exp_name in repo.list_branches():
        for run_hash in repo.list_branch_commits(exp_name):
            run = repo.select_run_metrics(exp_name, run_hash)
            if run is not None:
                run_params = copy.deepcopy(run.params)
                if run_params is None or len(run_params) == 0:
                    continue
                if '__METRICS__' in run_params:
                    del run_params['__METRICS__']
                dump_dict_values(run_params, {})
                params = deep_merge(params, run_params)
                for m in run.metrics.keys():
                    metrics.add(m)

    dump_dict_values(params, True)

    return {
        'params': params,
        'metrics': list(metrics),
    }


@projects_router.get('/{exp_name}/{commit}/models/{model_name}/')
async def experiment_model_api(exp_name, commit, model_name):
    project = Project()

    model_file = os.path.join(project.repo_path, exp_name, commit, 'objects', 'models', model_name)

    return FileResponse(model_file)


@projects_router.get('/{experiment_name}/{commit_id}/')
async def project_experiment_api(experiment_name, commit_id):
    project = Project()

    if not project.exists():
        raise HTTPException(status_code=404)

    dir_path = os.path.join(project.repo_path, experiment_name)

    # Check if experiment exists
    if not os.path.isdir(dir_path):
        return {
            'init': True,
            'branch_init': False,
        }

    # Get commits
    commits = get_branch_commits(dir_path)

    # Get specified commit
    commit = None
    if commit_id == 'latest':
        for commit_item, config in commits.items():
            if commit is None or config['date'] > commit['date']:
                commit = config
    else:
        commit = commits.get(commit_id)

    if not commit:
        return {
            'init': True,
            'branch_init': True,
            'branch_empty': True,
        }

    if 'process' in commit.keys():
        if not commit['process']['finish']:
            if commit['process'].get('start_date'):
                duration = time.time() - commit['process']['start_date']
                commit['process']['time'] = duration
            else:
                commit['process']['time'] = None
        elif commit['process'].get('start_date') is not None \
                and commit['process'].get('finish_date') is not None:
            commit['process']['time'] = commit['process']['finish_date'] \
                                        - commit['process']['start_date']

    objects_dir_path = os.path.join(dir_path, commit['hash'], 'objects')
    meta_file_path = os.path.join(objects_dir_path, 'meta.json')

    # Read meta file content
    try:
        with open(meta_file_path, 'r+') as meta_file:
            meta_file_content = json.loads(meta_file.read())
    except:
        meta_file_content = {}

    # Get all artifacts(objects) listed in the meta file
    metric_objects = []
    model_objects = []
    dir_objects = []
    map_objects = []
    stats_objects = []

    # Limit distributions
    for obj_key, obj in meta_file_content.items():
        if obj['type'] == 'dir':
            dir_objects.append({
                'name': obj['name'],
                'cat': obj['cat'],
                'data': obj['data'],
                'data_path': obj['data_path'],
            })
        elif obj['type'] == 'models':
            model_file_path = os.path.join(objects_dir_path,
                                           'models',
                                           '{}.aim'.format(obj['name']))
            model_file_size = os.stat(model_file_path).st_size
            model_objects.append({
                'name': obj['name'],
                'data': obj['data'],
                'size': model_file_size,
            })
        elif (obj['type'] == 'metrics'
              and obj['data_path'] != '__AIMRECORDS__') or \
                ('map' in obj['type'] or obj['type'] == 'map'):
                # obj['type'] == 'distribution':
            # Get object's data file path
            obj_data_file_path = os.path.join(objects_dir_path,
                                              obj['data_path'],
                                              obj_key)

            # Incompatible version
            if obj_key.endswith('.json'):
                raise HTTPException(status_code=501)

        if obj['type'] == 'metrics':
            steps = 200
            run = project.repo.select_run_metrics(experiment_name,
                                                  commit['hash'],
                                                  obj['name'])
            if run is not None and run.metrics.get(obj['name']) \
                    and len(run.metrics[obj['name']].traces):
                metric = run.metrics[obj['name']]
                run.open_storage()
                metric.open_artifact()
                traces = []
                for trace in metric.traces:
                    num = trace.num_records
                    step = (num // steps) or 1
                    for r in trace.read_records(slice(0, num, step)):
                        base, metric_record = MetricArtifact.deserialize_pb(r)
                        if unsupported_float_type(metric_record.value):
                            continue
                        trace.append((
                            base.step,  # 0 => step
                            metric_record.value,  # 1 => value
                        ))
                    if (num - 1) % steps != 0:
                        for r in trace.read_records(num-1):
                            base, metric_record = MetricArtifact.deserialize_pb(r)
                            if unsupported_float_type(metric_record.value):
                                continue
                            trace.append((
                                base.step,  # 0 => step
                                metric_record.value,  # 1 => value
                            ))
                    traces.append(trace.to_dict())
                metric.close_artifact()
                run.close_storage()
            else:
                traces = []

            metric_objects.append({
                'name': obj['name'],
                'mode': 'plot',
                'traces': traces,
            })
        elif 'map' in obj['type'] or obj['type'] == 'map':
            try:
                with open(obj_data_file_path, 'r+') as obj_data_file:
                    params_str = obj_data_file.read().strip()
                    if params_str:
                        map_objects.append({
                            'name': obj['name'],
                            'data': json.loads(params_str),
                            'nested': 'nested_map' in obj['type']
                        })
            except:
                pass

    # Return found objects
    return {
        'init': True,
        'branch_init': True,
        'branch_empty': False,
        'commit': commit,
        'commits': commits,
        'metrics': metric_objects,
        'models': model_objects,
        'dirs': dir_objects,
        'maps': map_objects,
        'stats': stats_objects,
    }


@projects_router.get('/insight/{insight_name}/')
async def project_insight_api(insight_name):
    raise HTTPException(status_code=404)
