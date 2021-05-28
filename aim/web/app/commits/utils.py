import json
from typing import Optional
from aim.artifacts.metric import Metric as MetricArtifact
from aim.ql.grammar import Expression
from aim.ql.utils import match
from aim.web.app.db import db
from aim.web.app.commits.models import TFSummaryLog
from aim.web.adapters.tf_summary_adapter import TFSummaryAdapter
from aim.web.app.utils import normalize_type, unsupported_float_type


def select_tf_summary_scalars(tags, expression: Optional[Expression] = None):
    # Search
    runs = []

    params = {}
    scalars_models = db.session.query(TFSummaryLog).all()
    for scalar in scalars_models:
        scalar_params = json.loads(scalar.params)
        for k, v in scalar_params.items():
            scalar_params[k] = normalize_type(v)
        params[scalar.log_path] = scalar_params

    if expression is not None:
        log_paths = []
        for scalar in scalars_models:
            hparams = {
                'params': params[scalar.log_path],
            }
            fields = {
                'params': hparams,
                'context': None,
            }
            if match(False, expression, None, fields, hparams):
                log_paths.append(scalar.log_path)
    else:
        log_paths = TFSummaryAdapter.list_log_dir_paths()

    # Get scalar paths
    for log_path in log_paths:
        tf = TFSummaryAdapter(log_path)
        scalars = tf.get_scalars(tags)
        dir_scalars = scalars['scalars']
        start_time = int(scalars['start_time']) \
            if isinstance(scalars['start_time'], (int, float)) else 0
        if dir_scalars and len(dir_scalars) > 0:
            runs.append({
                'name': log_path,
                'date': start_time,
                'run_hash': TFSummaryAdapter.name_to_hash(log_path),
                'experiment_name': 'TF',
                'metrics': dir_scalars,
                'params': {
                    'params': params.get(log_path) or {},
                },
                'source': 'tf_summary',
            })

    return runs


def scale_trace_steps(max_metric_len, max_steps):
    scaled_steps_len = max_steps
    if scaled_steps_len > max_metric_len:
        scaled_steps_len = max_metric_len
    if scaled_steps_len:
        scaled_steps = slice(0, max_metric_len,
                             max_metric_len // scaled_steps_len)
    else:
        scaled_steps = slice(0, 0)
    return scaled_steps


def separate_select_statement(select: list) -> tuple:
    aim_select = []
    tf_select = []

    for s in select:
        if s.startswith('tf:'):
            adapter, _, name = s.partition(':')
            tf_select.append(name)
        else:
            aim_select.append(s)

    return aim_select, tf_select


def is_tf_run(run) -> bool:
    return isinstance(run, dict) and run.get('source') == 'tf_summary'


def process_trace_record(r, trace, x_axis_trace, x_idx):
    base, metric_record = MetricArtifact.deserialize_pb(r)
    if unsupported_float_type(metric_record.value):
        return

    if x_axis_trace is not None:
        # try to initialize new value for x_axis from already available sources
        if x_axis_trace.metric == trace.metric:
            new_x_axis_value = metric_record.value
        else:
            new_x_axis_value = x_axis_trace.tmp_data.get(x_idx)
        if new_x_axis_value:
            if x_axis_trace.current_x_axis_value and new_x_axis_value < x_axis_trace.current_x_axis_value:
                trace.alignment['is_asc'] = False
            x_axis_trace.current_x_axis_value = new_x_axis_value
        else:
            # if there was no available value for x_idx index from available sources read from storage
            try:
                x_r = next(x_axis_trace.read_records(x_idx))
                _, x_axis_metric_record = MetricArtifact.deserialize_pb(x_r)
                if not unsupported_float_type(x_axis_metric_record.value):
                    new_x_axis_value = x_axis_metric_record.value
                    if new_x_axis_value:
                        if x_axis_trace.current_x_axis_value and \
                                new_x_axis_value < x_axis_trace.current_x_axis_value:
                            trace.alignment['is_asc'] = False
                    x_axis_trace.current_x_axis_value = new_x_axis_value
                    x_axis_trace.tmp_data[x_idx] = x_axis_trace.current_x_axis_value
                else:
                    trace.alignment['skipped_steps'] += 1
            except StopIteration:
                trace.alignment['is_synced'] = False
    trace.append((
        metric_record.value,
        base.step,
        base.epoch if base.has_epoch else None,
        base.timestamp,
        x_axis_trace.current_x_axis_value if x_axis_trace else None
    ))
