from asp import FigureSequence

c_hash = session_state.get('container_hash')

if c_hash is None:
    ui.header("Figures")
    form = ui.form("Search")
    query = form.text_input(value="")


figures = FigureSequence.filter(f'c.hash=="{c_hash}"' if c_hash else query)


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
    exclude_keys = ['type', 'container_type', 'sequence_type', 'sequence_full_type', 'hash', 'axis_names', 'axis.epoch',
                    'item_type', 'container_full_type', 'values', 'data']

    page_data = data[(page_num - 1) * page_size:page_num * page_size]

    for i, page_item in enumerate(page_data):
        items = flatten(page_item).items()
        for key, value in items:
            if key in exclude_keys:
                continue
            else:
                if key == "blobs.data":
                    key = "data"
                    value = ((page_num - 1) * page_size) + i
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
        'Page', value=1, min=1, max=int(len(figures) / int(items_per_page)) + 1)

row2.table(get_table_data(figures, int(items_per_page), page_num), {
    'container.hash': lambda val: ui.board_link('run.py', val, state={'container_hash': val}),
    "data": lambda val: ui.figures([figures[int(val)]]),
})
