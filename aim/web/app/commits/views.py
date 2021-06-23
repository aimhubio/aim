import json
import os
import time

from fastapi import HTTPException, Request
from aim.web.app.utils import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from pyrser.error import Diagnostic, Severity, Notification
from typing import Optional

from aim.ql.grammar.statement import Statement, Expression
from aim.web.app.projects.project import Project
from aim.web.app.commits.models import Commit, TFSummaryLog, Tag
from aim.web.app.db import get_session
from aim.web.adapters.tf_summary_adapter import TFSummaryAdapter
from aim.web.app.commits.utils import (
    select_tf_summary_scalars,
    separate_select_statement,
    is_tf_run,
    process_trace_record,
    process_custom_aligned_run,
    runs_resp_generator
)

commits_router = APIRouter()


@commits_router.get('/search/run/')
async def commits_search_api(q: Optional[str] = ''):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    raw_expression = q.strip()

    if 'run.archived' not in raw_expression:
        default_expression = 'run.archived is not True'
    else:
        default_expression = None

    if raw_expression:
        try:
            parser = Expression()
            parser.parse(raw_expression)
        except Diagnostic as d:
            parser_error_logs = d.logs or []
            for error_log in reversed(parser_error_logs):
                if not isinstance(error_log, Notification):
                    continue
                if error_log.severity != Severity.ERROR:
                    continue
                error_location = error_log.location
                if error_location:
                    JSONResponse(content={
                        'type': 'parse_error',
                        'statement': raw_expression,
                        'location': error_location.col,
                    }, status_code=403)
            raise HTTPException(status_code=403)
        except Exception:
            raise HTTPException(status_code=403)

    runs = project.repo.select_runs(raw_expression, default_expression)

    serialized_runs = []
    for run in runs:
        serialized_runs.append(run.to_dict())

    return {
        'runs': serialized_runs,
    }


@commits_router.post('/search/metric/align')
async def commits_metric_custom_align_api(request: Request):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    request_data = await request.json()

    x_axis_metric_name = request_data.get('align_by')
    requested_runs = request_data.get('runs')
    if not (x_axis_metric_name and requested_runs):
        HTTPException(status_code=403)
    processed_runs = []

    for run_data in requested_runs:
        processed_run = process_custom_aligned_run(project, run_data, x_axis_metric_name)
        if processed_run:
            processed_runs.append(processed_run)

    response = {
        'runs': [],
    }

    return StreamingResponse(runs_resp_generator(response, processed_runs, ['params', 'date']),
                             media_type='application/json')


@commits_router.get('/search/metric')
async def commit_metric_search_api(q: str, p: int = 50,  x_axis: Optional[str] = None):
    steps_num = p

    if x_axis:
        x_axis = x_axis.strip()

    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    search_statement = q.strip()

    # Parse statement
    try:
        parser = Statement()
        parsed_stmt = parser.parse(search_statement.strip())
    except Diagnostic as d:
        parser_error_logs = d.logs or []
        for error_log in reversed(parser_error_logs):
            if not isinstance(error_log, Notification):
                continue
            if error_log.severity != Severity.ERROR:
                continue
            error_location = error_log.location
            if error_location:
                return JSONResponse(content={
                    'type': 'parse_error',
                    'statement': search_statement,
                    'location': error_location.col,
                }, status_code=403)
        raise HTTPException(status_code=403)
    except Exception:
        raise HTTPException(status_code=403)

    statement_select = parsed_stmt.node['select']
    statement_expr = parsed_stmt.node['expression']

    aim_select, tf_logs = separate_select_statement(statement_select)

    if len(tf_logs) and x_axis:
        # raise error if tf_run and x_axis are present together
        # discuss error message needs
        raise HTTPException(status_code=403)

    if 'run.archived' not in search_statement:
        default_expression = 'run.archived is not True'
    else:
        default_expression = None

    aim_select_result = project.repo.select(aim_select,
                                            statement_expr,
                                            default_expression)
    (
        aim_selected_runs,
        aim_selected_params,
        aim_selected_metrics,
    ) = (
        aim_select_result.runs,
        aim_select_result.get_selected_params(),
        aim_select_result.get_selected_metrics_context()
    )

    aim_selected_runs.sort(key=lambda r: r.config.get('date'), reverse=True)

    response = {
        'runs': [],
        'params': [],
        'agg_metrics': {},
        'meta': {
            'tf_selected': False,
            'params_selected': False,
            'metrics_selected': False,
        },
    }

    retrieve_traces = False
    retrieve_agg_metrics = False

    if len(aim_selected_params):
        response['meta']['params_selected'] = True
        response['params'] = aim_selected_params
        if len(aim_selected_metrics):
            response['meta']['metrics_selected'] = True
            response['agg_metrics'] = aim_selected_metrics
            retrieve_agg_metrics = True
    elif len(aim_selected_metrics) or len(tf_logs):
        response['meta']['metrics_selected'] = True
        retrieve_traces = True

    runs = []

    if aim_selected_runs and len(aim_selected_runs):
        runs += aim_selected_runs
    if len(tf_logs) > 0:
        if not retrieve_traces:
            # TODO: aggregate tf logs and return aggregated values
            response['meta']['tf_selected'] = True
            pass
        else:
            try:
                tf_runs = select_tf_summary_scalars(tf_logs, statement_expr)
                if tf_runs and len(tf_runs):
                    runs += tf_runs
            except:
                pass
            else:
                response['meta']['tf_selected'] = True

    if retrieve_traces:
        for run in runs:
            if is_tf_run(run):
                for metric in run['metrics']:
                    for trace in metric['traces']:
                        trace_scaled_data = []
                        for i in range(0,
                                       trace['num_steps'],
                                       trace['num_steps'] // steps_num or 1
                                       ):
                            trace_scaled_data.append(trace['data'][i])
                        trace['data'] = trace_scaled_data
            else:
                run.open_storage()
                x_axis_metric = None
                if x_axis:
                    try:
                        x_axis_metric = run.get_all_metrics().get(x_axis)
                        x_axis_metric.open_artifact()
                    except:
                        pass
                for metric in run.metrics.values():
                    try:
                        metric.open_artifact()
                        for trace in metric.traces:
                            step = (trace.num_records // steps_num) or 1
                            trace.slice = (0, trace.num_records, step)
                            x_axis_trace = None
                            if x_axis_metric is not None:
                                x_axis_trace = x_axis_metric.get_trace(trace.context)
                                if x_axis_trace is not None:
                                    trace.alignment = {
                                        'is_synced': True,
                                        'is_asc': True,
                                        'skipped_steps': 0,
                                        'aligned_by': {
                                            'metric_name': x_axis_metric.name,
                                            'trace_context': x_axis_trace.context
                                        }
                                    }
                            x_idx = 0
                            for r in trace.read_records(slice(*trace.slice)):
                                process_trace_record(r, trace, x_axis_trace, x_idx)
                                x_idx += step
                            if (trace.num_records - 1) % step != 0:
                                for r in trace.read_records(trace.num_records-1):
                                    process_trace_record(r, trace, x_axis_trace, trace.num_records-1)
                            if x_axis_trace is not None:
                                # clear current_x_axis_value for the x_axis_trace for the next possible iteration
                                x_axis_trace.current_x_axis_value = None
                    except:
                        pass

                    try:
                        metric.close_artifact()
                    except:
                        pass
                if x_axis:
                    try:
                        x_axis_metric.close_artifact()
                    except:
                        pass
                run.close_storage()

    if retrieve_agg_metrics:
        # TODO: Retrieve and return aggregated metrics
        pass

    return StreamingResponse(runs_resp_generator(response, runs), media_type='application/json')


@commits_router.get('/search/dictionary/')
async def commit_dictionary_api():
    # Get tf logs saved params
    # tf_logs_params = {}
    # tf_logs = TFSummaryLog.query.filter(
    #     TFSummaryLog.is_archived.is_(False)) \
    #     .all()
    #
    # for tf_log in tf_logs:
    #     tf_logs_params[tf_log.log_path] = {
    #         'data': tf_log.params_json,
    #     }
    # for tf_log_path, tf_log_params in tf_logs_params.items():
    #     dicts[tf_log_path] = tf_log_params

    return {}


@commits_router.get('/tf-summary/list/')
async def tf_summary_list_api():
    dir_paths = TFSummaryAdapter.list_log_dir_paths()
    return dir_paths


@commits_router.post('/tf-summary/params/list/')
async def tf_summary_params_list_api(request: Request):
    with get_session() as session:
        params_form = await request.json()
        path = params_form.get('path')

        if not path:
            return {'params': ''}

        tf_log = session.query(TFSummaryLog)\
            .filter((TFSummaryLog.log_path == path) & (TFSummaryLog.is_archived.is_(False)))\
            .first()
        if tf_log is None:
            return {'params': ''}

    return {
        'params': tf_log.params,
    }


@commits_router.post('/tf-summary/params/update/')
async def tf_summary_params_update_api(request: Request):
    with get_session() as session:
        params_form = await request.json()
        path = params_form.get('path')
        params = params_form.get('params')

        if not path:
            raise HTTPException(status_code=403)

        tf_log = session.query(TFSummaryLog)\
            .filter((TFSummaryLog.log_path == path) & (TFSummaryLog.is_archived.is_(False)))\
            .first()
        if tf_log is None:
            tf_log = TFSummaryLog(path)
            session.add(tf_log)

        tf_log.params = params
        session.commit()

    return {
        'params': params,
    }


@commits_router.get('/tags/{commit_hash}')
async def commit_tag_api(commit_hash: str):
    with get_session() as session:
        commit = session.query(Commit).filter(Commit.hash == commit_hash).first()

        if not commit:
            raise HTTPException(status_code=404)

        commit_tags = []
        for t in commit.tags:
            commit_tags.append({
                'id': t.uuid,
                'name': t.name,
                'color': t.color,
            })

    return commit_tags


@commits_router.post('/tags/update/')
async def commit_tag_update_api(request: Request):
    with get_session() as session:
        form = await request.json()

        commit_hash = form.get('commit_hash')
        experiment_name = form.get('experiment_name')
        tag_id = form.get('tag_id')

        commit = session.query(Commit)\
            .filter((Commit.hash == commit_hash) & (Commit.experiment_name == experiment_name))\
            .first()
        if not commit:
            commit = Commit(commit_hash, experiment_name)
            session.add(commit)
            session.commit()

        tag = session.query(Tag).filter(Tag.uuid == tag_id).first()
        if not tag:
            raise HTTPException(status_code=404)

        if tag in commit.tags:
            commit.tags.remove(tag)
        else:
            for t in commit.tags:
                commit.tags.remove(t)
            commit.tags.append(tag)

        session.commit()

    return {
        'tag': list(map(lambda t: t.uuid, commit.tags)),
    }


@commits_router.get('/{experiment}/{commit_hash}/info/')
async def commit_info_api(experiment: str, commit_hash: str):
    project = Project()

    commit_path = os.path.join(project.repo_path, experiment, commit_hash)

    if not os.path.isdir(commit_path):
        raise HTTPException(status_code=404)

    commit_config_file_path = os.path.join(commit_path, 'config.json')
    info = {}

    try:
        with open(commit_config_file_path, 'r+') as commit_config_file:
            info = json.loads(commit_config_file.read())
    except:
        pass

    process = info.get('process')
    if process:
        if not process['finish']:
            if process.get('start_date'):
                process['time'] = time.time() - process['start_date']
            else:
                process['time'] = None

    return info


@commits_router.post('/{experiment}/{commit_hash}/archivation/update/')
async def commit_archivation_api(experiment, commit_hash):
    # Get project
    project = Project()
    if not project.exists():
        raise HTTPException(status_code=404)

    if project.repo.is_archived(experiment, commit_hash):
        project.repo.unarchive(experiment, commit_hash)
        return {
            'archived': False,
        }
    else:
        project.repo.archive(experiment, commit_hash)
        return {
            'archived': True,
        }
