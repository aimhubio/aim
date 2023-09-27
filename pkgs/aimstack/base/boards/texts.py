from base import TextSequence
import math

c_hash = session_state.get('container_hash')

search_signal = "search"

if c_hash is None:
    ui.header('Texts')
    form = ui.form("Search", signal=search_signal)
    query = form.text_input(value="")

texts = TextSequence.filter(f'c.hash=="{c_hash}"' if c_hash else query, signal=search_signal)

texts_flat_list = []

for text in texts:
    for record in text['values']:
        if type(record) is list:
            for rec in record:
                text_item = text.copy()
                text_item.pop('values')
                text_item.update(rec)
                texts_flat_list.append(text_item)
        else:
            text_item = text.copy()
            text_item.pop('values')
            text_item.update(record)
            texts_flat_list.append(text_item)

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
def merge_dicts(dict1, dict2):
    merged_dict = dict1.copy()
    merged_dict.update(dict2)
    return merged_dict


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
            if key == 'data':
                value = ((page_num - 1) * page_size) + i
                append(key, value)
            elif key in item:
                value = item[key]
                append(key, value)

    return table_data


if texts_flat_list:
    row1, row2 = ui.rows(2)

    items_per_page = row1.select('Items per page', ('5', '10', '50', '100'))
    total_pages = math.ceil((len(texts_flat_list) / int(items_per_page)))
    page_numbers = [str(i) for i in range(1, total_pages + 1)]
    page_num = row1.select('Page', page_numbers, index=0)

    table_data = get_table_data(
        data=texts_flat_list,
        keys=['name', 'container.hash', 'context',
              'format', 'range', 'data'],
        page_size=int(items_per_page),
        page_num=int(page_num)
    )

    row2.table(table_data, {
        'container.hash': lambda val: ui.board_link('run.py', val, state={'container_hash': val}),
        'data': lambda val: ui.texts([texts_flat_list[int(val)]])
    })
else:
    text = ui.text('No texts found')
