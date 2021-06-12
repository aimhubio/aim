import json
import os
import time

from flask import (
    Blueprint,
    jsonify,
    request,
    make_response,
    Response
)
from flask_restful import Api, Resource
from pyrser.error import Diagnostic, Severity, Notification

from aim.ql.grammar.statement import Statement, Expression
from aim.web.app.projects.project import Project
from aim.web.app.commits.models import Commit, TFSummaryLog, Tag
from aim.web.app.db import db
from aim.web.adapters.tf_summary_adapter import TFSummaryAdapter
from aim.web.app.commits.utils import (
    select_tf_summary_scalars,
    separate_select_statement,
    is_tf_run,
    process_trace_record,
    process_custom_aligned_run,
    runs_resp_generator
)

commits_bp = Blueprint('commits', __name__)
commits_api = Api(commits_bp)


@commits_api.resource('/search/run')
class CommitSearchApi(Resource):
    def get(self):
        # Get project
        project = Project()
        if not project.exists():
            return make_response(jsonify({}), 404)

        raw_expression = request.args.get('q').strip()

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
                        return make_response(jsonify({
                            'type': 'parse_error',
                            'statement': raw_expression,
                            'location': error_location.col,
                        }), 403)
                return make_response(jsonify({}), 403)
            except Exception:
                return make_response(jsonify({}), 403)

        runs = project.repo.select_runs(raw_expression, default_expression)

        serialized_runs = []
        for run in runs:
            serialized_runs.append(run.to_dict())

        return jsonify({
            'runs': serialized_runs,
        })


@commits_api.resource('/search/metric/align')
class CommitMetricCustomAlignApi(Resource):
    def post(self):
        # Get project
        project = Project()
        if not project.exists():
            return make_response(jsonify({}), 404)

        request_data = json.loads(request.data)

        x_axis_metric_name = request_data.get('align_by')
        requested_runs = request_data.get('runs')
        if not (x_axis_metric_name and requested_runs):
            make_response(jsonify({}), 403)
        processed_runs = []

        for run_data in requested_runs:
            processed_run = process_custom_aligned_run(project, run_data, x_axis_metric_name)
            if processed_run:
                processed_runs.append(processed_run)

        response = {
            'runs': [],
        }

        return Response(runs_resp_generator(response, processed_runs, ['params', 'date']), mimetype='application/json')


@commits_api.resource('/search/metric')
class CommitMetricSearchApi(Resource):
    def get(self):
        try:
            steps_num = int(request.args.get('p').strip())
        except:
            steps_num = 50

        try:
            x_axis = request.args.get('x_axis').strip()
        except AttributeError:
            x_axis = None

        # Get project
        project = Project()
        if not project.exists():
            return make_response(jsonify({}), 404)

        search_statement = request.args.get('q').strip()

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
                    return make_response(jsonify({
                        'type': 'parse_error',
                        'statement': search_statement,
                        'location': error_location.col,
                    }), 403)
            return make_response(jsonify({}), 403)
        except Exception:
            return make_response(jsonify({}), 403)

        statement_select = parsed_stmt.node['select']
        statement_expr = parsed_stmt.node['expression']

        aim_select, tf_logs = separate_select_statement(statement_select)

        if len(tf_logs) and x_axis:
            # raise error if tf_run and x_axis are present together
            # discuss error message needs
            return make_response(jsonify({}), 403)

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

        return Response(runs_resp_generator(response, runs), mimetype='application/json')


@commits_api.resource('/search/dictionary')
class CommitDictionarySearchApi(Resource):
    def get(self):
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

        return jsonify({})


@commits_api.resource('/tf-summary/list')
class TFSummaryListApi(Resource):
    def get(self):
        dir_paths = TFSummaryAdapter.list_log_dir_paths()
        return jsonify(dir_paths)


@commits_api.resource('/tf-summary/params/list')
class TFSummaryParamsListApi(Resource):
    def post(self):
        params_form = request.form
        path = params_form.get('path')

        if not path:
            return jsonify({'params': ''})

        tf_log = TFSummaryLog.query.filter((TFSummaryLog.log_path == path) &
                                           (TFSummaryLog.is_archived.is_(False))
                                           ).first()
        if tf_log is None:
            return jsonify({'params': ''})

        return jsonify({
            'params': tf_log.params,
        })


@commits_api.resource('/tf-summary/params/update')
class TFSummaryParamsUpdateApi(Resource):
    def post(self):
        params_form = request.form
        path = params_form.get('path')
        params = params_form.get('params')
        parsed_params = params_form.get('parsed_params')

        if not path:
            return make_response(jsonify({}), 403)

        tf_log = TFSummaryLog.query.filter((TFSummaryLog.log_path == path) &
                                           (TFSummaryLog.is_archived.is_(False))
                                           ).first()
        if tf_log is None:
            tf_log = TFSummaryLog(path)
            db.session.add(tf_log)

        tf_log.params = params
        db.session.commit()

        return jsonify({
            'params': params,
        })


@commits_api.resource('/tags/<commit_hash>')
class CommitTagApi(Resource):
    def get(self, commit_hash):
        commit = Commit.query.filter(Commit.hash == commit_hash).first()

        if not commit:
            return make_response(jsonify({}), 404)

        commit_tags = []
        for t in commit.tags:
            commit_tags.append({
                'id': t.uuid,
                'name': t.name,
                'color': t.color,
            })

        return jsonify(commit_tags)


@commits_api.resource('/tags/update')
class CommitTagUpdateApi(Resource):
    def post(self):
        form = request.form

        commit_hash = form.get('commit_hash')
        experiment_name = form.get('experiment_name')
        tag_id = form.get('tag_id')

        commit = Commit.query.filter((Commit.hash == commit_hash) &
                                     (Commit.experiment_name == experiment_name)
                                     ).first()
        if not commit:
            commit = Commit(commit_hash, experiment_name)
            db.session.add(commit)
            db.session.commit()

        tag = Tag.query.filter(Tag.uuid == tag_id).first()
        if not tag:
            return make_response(jsonify({}), 404)

        if tag in commit.tags:
            commit.tags.remove(tag)
        else:
            for t in commit.tags:
                commit.tags.remove(t)
            commit.tags.append(tag)

        db.session.commit()

        return {
            'tag': list(map(lambda t: t.uuid, commit.tags)),
        }


@commits_api.resource('/<experiment>/<commit_hash>/info')
class CommitInfoApi(Resource):
    def get(self, experiment, commit_hash):
        project = Project()

        commit_path = os.path.join(project.repo_path, experiment, commit_hash)

        if not os.path.isdir(commit_path):
            return make_response(jsonify({}), 404)

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

        return jsonify(info)


@commits_api.resource('/<experiment>/<commit_hash>/archivation/update')
class CommitArchivationApi(Resource):
    def post(self, experiment, commit_hash):
        # Get project
        project = Project()
        if not project.exists():
            return make_response(jsonify({}), 404)

        if project.repo.is_archived(experiment, commit_hash):
            project.repo.unarchive(experiment, commit_hash)
            return jsonify({
                'archived': False,
            })
        else:
            project.repo.archive(experiment, commit_hash)
            return jsonify({
                'archived': True,
            })
