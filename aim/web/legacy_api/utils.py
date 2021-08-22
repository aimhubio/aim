from engine.metric_artifact import Metric as MetricArtifact
from aim.web.api.utils import unsupported_float_type


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
