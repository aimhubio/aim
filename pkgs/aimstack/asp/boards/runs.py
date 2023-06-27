from asp import Run
from collections.abc import MutableMapping

runs = Run.filter('')

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
def get_table_data (runs=[]):
    table_data = {}
    exclude_keys = ['type', 'container_type', 'container_full_type']

    for run in runs:
        for key, value in flatten(run).items():
            if key in exclude_keys:
                continue
            else:
                if key in table_data:
                    table_data[key].append(f'{value}')
                else:
                    table_data[key] = [f'{value}']
    return table_data

# Table
ui.text('Runs')
ui.table(get_table_data(runs), {
    'hash': lambda val: ui.board_link('run.py', val, state={ 'hash': val }),
})
