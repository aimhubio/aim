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
def get_table_data(data=[], keys=[], page_size=10, page_num=1):
    table_data = {}
    page_data = data[(page_num - 1) * page_size:page_num * page_size]

    for key in keys:
        for i, page_item in enumerate(page_data):
            flattened = flatten(page_item)
            if key in flattened:
                value = flattened[key]
                if key == 'blobs.data':
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

with row2:
    ui.table(get_table_data(
        data=figures,
        keys=['name', 'container.hash', 'context.train',
              'format', 'source', 'range', 'blobs.data', 'step'],
        page_size=int(items_per_page),
        page_num=page_num
    ), {
        'container.hash': lambda val: ui.board_link('run.py', val, state={'container_hash': val}),
        "blobs.data": lambda val: ui.figures([figures[int(val)]]),
    })
