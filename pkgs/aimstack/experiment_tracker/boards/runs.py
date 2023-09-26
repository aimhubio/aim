from experiment_tracker import TrainingRun

search_signal = "search"

form = ui.form('Search', signal=search_signal)

query = form.text_input(value='')
extra_query = session_state.get('extra_query')
if extra_query:
    if query != '':
        query = f'({extra_query}) and ({query})'
    else:
        query = extra_query

runs = TrainingRun.filter(query, signal=search_signal)


def flatten(dictionary, parent_key='', separator='.'):
    flattened = {}
    for key, value in dictionary.items():
        new_key = f"{parent_key}{separator}{key}" if parent_key else key
        if isinstance(value, dict):
            flattened.update(flatten(value, new_key, separator=separator))
        else:
            flattened[new_key] = value
    return flattened


@memoize
def get_table_data(data=[], page_size=10, page_num=1, should_fold=True):
    table_data = {}
    exclude_keys = ['type', 'container_type', 'container_full_type']

    runs = data[(page_num - 1) * page_size:page_num * page_size]

    for run in runs:
        items = run.items() if should_fold else flatten(run).items()
        for key, value in items:
            if key in exclude_keys:
                continue
            else:
                if key in table_data:
                    table_data[key].append(f'{value}')
                else:
                    table_data[key] = [f'{value}']
    return table_data


row1, row2 = ui.rows(2)

with row1:
    items_per_page = ui.select(
        'Items per page', options=('5', '10', '50', '100'), index=1)
    page_num = ui.number_input(
        'Page', value=1, min=1, max=int(len(runs) / int(items_per_page)) + 1)
    cols_folding = ui.toggle_button(label='Columns folding',
                                    left_value='Fold',
                                    right_value='Unfold',
                                    index=1
                                    )

row2.table(get_table_data(runs, int(items_per_page), page_num, cols_folding == 'Fold'), {
    'hash': lambda val: ui.board_link('run.py', val, state={'container_hash': val}),
})
