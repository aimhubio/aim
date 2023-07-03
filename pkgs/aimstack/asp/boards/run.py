from asp import Run, Metric
from itertools import groupby
from collections.abc import MutableMapping
import math

if 'hash' in session_state:
    hash = session_state['hash']
else:
    hash = None


@memoize
def memoize_query(cb, query):
    return cb(query)


runs = memoize_query(Run.filter, f'c.hash=="{hash}"')
run = None

if runs:
    run = runs[0]
    ui.subheader(f'Run: {run["hash"]}')
else:
    ui.subheader('No runs found')
    ui.board_link('runs.py', 'Explore runs')


@memoize
def flatten(dictionary, parent_key='', separator='.'):
    items = []
    for key, value in dictionary.items():
        new_key = parent_key + separator + key if parent_key else key
        if isinstance(value, MutableMapping):
            items.extend(flatten(value, new_key, separator=separator).items())
        else:
            items.append((new_key, value))
    return dict(items)


@memoize
def merge_dicts(dict1, dict2):
    merged_dict = dict1.copy()
    merged_dict.update(dict2)
    return merged_dict


if run:
    params_tab, metrics_tab = ui.tabs(('Params', 'Metrics'))

    with params_tab:
        params = run['params']
        if params:
            ui.json(params)
        else:
            ui.text('No parameters found')

    with metrics_tab:
        metrics = memoize_query(Metric.filter, f'c.hash=="{hash}"')
        if metrics:
            row_controls, = ui.rows(1)
            group_fields = row_controls.multi_select(
                'Group by:', ('name', 'context', 'context.subset', 'hash'))
            metrics_processed = [merge_dicts(
                metric, flatten(metric)) for metric in metrics]

            def key_func(x): return tuple(
                str(x[field]) for field in group_fields)

            grouped_iterator = groupby(
                sorted(metrics_processed, key=key_func), key_func)
            grouped_data = [list(group) for key, group in grouped_iterator]
            x_axis = row_controls.select('Align by:', ('steps', 'axis.epoch'))
            y_axis = 'values'
            grouped_data_length = len(grouped_data)
            ui.html('<br />')
            rows = ui.rows(math.ceil(grouped_data_length/2))
            for i, row in enumerate(rows):
                col1, col2 = row.columns(2)
                col1_index = i*2
                col2_index = i*2 + 1
                if col1_index < grouped_data_length:
                    data = grouped_data[col1_index]
                    for group_field in group_fields:
                        col1.text(f'{group_field}: {data[0][group_field]}')
                    col1.line_chart(data, x=x_axis, y=y_axis, color=['name'])
                if col2_index < grouped_data_length:
                    data = grouped_data[col2_index]
                    for group_field in group_fields:
                        col2.text(f'{group_field}: {data[0][group_field]}')
                    col2.line_chart(data, x=x_axis, y=y_axis, color=['name'])
        else:
            ui.text(f'No metrics found')
