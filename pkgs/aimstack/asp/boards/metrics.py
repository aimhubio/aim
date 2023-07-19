from asp import Metric
from itertools import groupby
import math

run_hash = None
if 'run_hash' in session_state:
    run_hash = session_state['run_hash']

if run_hash is None:
    ui.header("Metrics")
    form = ui.form("Search")
    query = form.text_input(value="")


metrics = Metric.filter(
    f'c.hash=="{run_hash}"' if run_hash else query)


def flatten(dictionary, parent_key='', separator='.'):
    items = []
    for key, value in dictionary.items():
        new_key = parent_key + separator + key if parent_key else key
        if isinstance(value, dict):
            items.extend(flatten(value, new_key, separator=separator).items())
        else:
            items.append((new_key, value))
    return dict(items)


@memoize
def get_table_data(data=[], page_size=10, page_num=1):
    table_data = {}
    exclude_keys = ['type', 'container_type', 'sequence_type', 'sequence_full_type', 'axis.epoch', 'steps',
                    'item_type', 'container_full_type', 'values']

    page_data = data[(page_num - 1) * page_size:page_num * page_size]

    for i, page_item in enumerate(page_data):
        items = flatten(page_item).items()
        for key, value in items:
            if key in exclude_keys:
                continue
            else:
                if key == 'blobs.data':
                    key = 'data'
                    value = i
                if key in table_data:
                    table_data[key].append(f'{value}')
                else:
                    table_data[key] = [f'{value}']
    return table_data


@memoize
def merge_dicts(dict1, dict2):
    merged_dict = dict1.copy()
    merged_dict.update(dict2)
    return merged_dict


if metrics:
    row_controls, = ui.rows(1)
    group_fields = row_controls.multi_select(
        'Group by:', ('name', 'context', 'context.subset', 'container.hash'))
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
    column_numbers = [int(i) for i in range(1, int(grouped_data_length) + 1)]
    column_count = row_controls.select(
        'Columns', options=(column_numbers), index=0)
    rows = ui.rows(math.ceil(grouped_data_length / int(column_count)))
    for i, row in enumerate(rows):
        cols = row.columns(int(column_count))
        for j, col in enumerate(cols):
            data_index = i*int(column_count)+j
            if data_index < grouped_data_length:
                data = grouped_data[data_index]
                for group_field in group_fields:
                    col.text(f'{group_field}: {data[0][group_field]}')
                col.line_chart(
                    data, x=x_axis, y=y_axis, color=['name'])

    row1, row2 = ui.rows(2)
    with row1:
        items_per_page = ui.select(
            'Items per page', options=('5', '10', '50', '100'), index=1)

    total_pages = math.ceil((len(metrics) / int(items_per_page)))

    page_numbers = [str(i) for i in range(1, total_pages + 1)]

    with row1:
        page_num = ui.select('Page', options=page_numbers, index=0)

    row2.table(get_table_data(metrics, int(items_per_page), int(page_num)), {
        'container.hash': lambda val: ui.board_link('run.py', val, state={'hash': val}),
    })

else:
    ui.text(f'No metrics found')
