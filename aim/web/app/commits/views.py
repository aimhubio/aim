import json
import os
import time

from flask import Blueprint, jsonify, request, \
    abort, make_response, send_from_directory, Response
from flask_restful import Api, Resource

from pyrser.error import Diagnostic, Severity, Notification
from aim.ql.grammar.statement import Statement, Expression
from aim.artifacts.metric import Metric as MetricArtifact

from aim.web.app import App
from aim.web.app.projects.project import Project
from aim.web.app.commits.models import Commit, TFSummaryLog, Tag
from aim.web.app.db import db
from aim.web.adapters.tf_summary_adapter import TFSummaryAdapter
from aim.web.app.utils import unsupported_float_type
from aim.web.app.commits.utils import (
    select_tf_summary_scalars,
    scale_trace_steps,
    separate_select_statement,
    is_tf_run,
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


@commits_api.resource('/search/metric')
class CommitMetricSearchApi(Resource):
    def get(self):
        try:
            steps_num = int(request.args.get('p').strip())
        except:
            steps_num = 50

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
                    for metric in run.metrics.values():
                        try:
                            metric.open_artifact()
                            for trace in metric.traces:
                                step = (trace.num_records // steps_num) or 1
                                trace_steps = slice(0, trace.num_records, step)
                                for r in trace.read_records(trace_steps):
                                    base, metric_record = MetricArtifact.deserialize_pb(r)
                                    if unsupported_float_type(metric_record.value):
                                        continue
                                    trace.append((
                                        metric_record.value,
                                        base.step,
                                        (base.epoch if base.has_epoch else None),
                                        base.timestamp,
                                    ))
                                if (trace.num_records - 1) % step != 0:
                                    for r in trace.read_records(trace.num_records-1):
                                        base, metric_record = MetricArtifact.deserialize_pb(r)
                                        if unsupported_float_type(metric_record.value):
                                            continue
                                        trace.append((
                                            metric_record.value,
                                            base.step,
                                            (base.epoch if base.has_epoch else None),
                                            base.timestamp,
                                        ))
                        except:
                            pass

                        try:
                            metric.close_artifact()
                        except:
                            pass
                    run.close_storage()

        if retrieve_agg_metrics:
            # TODO: Retrieve and return aggregated metrics
            pass

        def runs_resp_generator():
            with App.api.app_context():
                yield json.dumps({
                    'header': response,
                }).encode() + '\n'.encode()
                for run in runs:
                    if not is_tf_run(run):
                        yield json.dumps({
                            'run': run.to_dict(include_only_selected_agg_metrics=True),
                        }).encode() + '\n'.encode()
                    else:
                        yield json.dumps({
                            'run': run,
                        }).encode() + '\n'.encode()

        return Response(runs_resp_generator(), mimetype='application/json')


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
        commit_path = os.path.join(os.getcwd(), '.aim', experiment, commit_hash)

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
