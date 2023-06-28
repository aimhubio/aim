from collections.abc import MutableMapping
from asp import AudioSequence

audios = AudioSequence.filter()
ui.header('Audios')


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
def get_table_data(data=[]):
    table_data = {}
    exclude_keys = ['type', 'container_type', 'sequence_type', 'sequence_full_type',
                    'item_type', 'container_full_type', 'data']

    for i, audio in enumerate(data):
        flattened = flatten(audio)
        for key, value in flattened.items():
            if key in exclude_keys:
                continue
            else:
                if key == 'values':
                    value = i
                if key in table_data:
                    table_data[key].append(f'{value}')
                else:
                    table_data[key] = [f'{value}']
    return table_data


print(get_table_data(audios))

ui.table(get_table_data(audios), {
    'hash': lambda val: ui.board_link('run.py', val, state={'hash': val}),
    'values': lambda val: ui.audios([audios[int(val)]])
})
