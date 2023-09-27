from base import Metric
from itertools import groupby
import math

c_hash = session_state.get('container_hash')

search_signal = "search"

if c_hash is None:
    ui.header("Metrics")
    form = ui.form("Search", signal=search_signal)
    query = form.text_input(value="")

metrics = Metric.filter(f'c.hash=="{c_hash}"' if c_hash else query, signal=search_signal)


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
def get_table_data(data=[], keys=[], page_size=10, page_num=1):
    table_data = {}
    page_data = data[(page_num - 1) * page_size:page_num * page_size]

    def append(key, value):
        if key in table_data:
            table_data[key].append(f'{value}')
        else:
            table_data[key] = [f'{value}']

    for key in keys:
        for i, page_item in enumerate(page_data):
            flattened_item = flatten(page_item)
            item = merge_dicts(page_item, flattened_item)
            if key in item:
                value = item[key]
                append(key, value)

    return table_data


@memoize
def merge_dicts(dict1, dict2):
    merged_dict = dict1.copy()
    merged_dict.update(dict2)
    return merged_dict


if metrics:
    row_controls, = ui.rows(1)

    group_fields = row_controls.multi_select(
        'Group by:', ('container.hash', 'name', 'context'),
        index=[1]
    )

    metrics_processed = [merge_dicts(m, flatten(m)) for m in metrics]

    def key_func(x): return tuple(str(x[field]) for field in group_fields)

    grouped_iterator = groupby(
        sorted(metrics_processed, key=key_func), key_func)
    grouped_data = [list(group) for key, group in grouped_iterator]

    x_axis = 'steps'
    y_axis = 'values'

    color_by = row_controls.multi_select(
        'Color by:', ('container.hash', 'name', 'context'),
        index=[0]
    )
    stroke_style = row_controls.multi_select(
        'Style by:', ('container.hash', 'name', 'context'),
        index=[2]
    )

    grouped_data_length = len(grouped_data)

    column_numbers = [str(i) for i in range(1, int(grouped_data_length) + 1)]
    column_count = row_controls.select('Columns', column_numbers, index=0)

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
                    data, x=x_axis, y=y_axis, color=color_by, stroke_style=stroke_style)

    row1, row2 = ui.rows(2)

    items_per_page = row1.select('Items per page', ('5', '10', '50', '100'))

    total_pages = math.ceil((len(metrics) / int(items_per_page)))
    page_numbers = [str(i) for i in range(1, total_pages + 1)]
    page_num = row1.select('Page', page_numbers, index=0)

    table_data = get_table_data(
        data=metrics,
        keys=['name', 'container.hash', 'context', 'range'],
        page_size=int(items_per_page),
        page_num=int(page_num),
    )

    row2.table(table_data, {
        'container.hash': lambda val: ui.board_link('run.py', val, state={'container_hash': val}),
    })

else:
    ui.text('No metrics found')
