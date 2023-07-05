# from collections.abc import MutableMapping
from asp import AudioSequence

audios = AudioSequence.filter()
ui.header('Audios')

ui.audios(audios)

# ui.table({
#     'a': [i for i in range(len(audios))]
# }, {
#     'a': lambda i: ui.audios([audios[i]])
# })


# def flatten(dictionary, parent_key='', separator='.'):
#     items = []
#     for key, value in dictionary.items():
#         new_key = parent_key + separator + key if parent_key else key
#         if isinstance(value, MutableMapping):
#             items.extend(flatten(value, new_key, separator=separator).items())
#         else:
#             items.append((new_key, value))
#     return dict(items)


# @memoize
# def get_table_data(data=[], page_size=10, page_num=1, should_fold=True):
#     table_data = {}
#     exclude_keys = ['type', 'container_type', 'sequence_type', 'sequence_full_type', 'hash', 'axis_names',
#                     'item_type', 'container_full_type', 'data']

#     audios = data[(page_num - 1) * page_size:page_num * page_size]

#     for i, audio in enumerate(audios):
#         items = audio.items() if should_fold else flatten(audio).items()
#         for key, value in items:
#             if key in exclude_keys:
#                 continue
#             else:
#                 if key == 'values':
#                     value = i
#                 if key in table_data:
#                     table_data[key].append(f'{value}')
#                 else:
#                     table_data[key] = [f'{value}']
#     return table_data


# row1, row2 = ui.rows(2)

# with row1:
#     items_per_page = ui.select(
#         'Items per page', options=('5', '10', '50', '100'), index=1)
#     page_num = ui.number_input(
#         'Page', value=1, min=1, max=int(len(audios) / int(items_per_page)) + 1)
#     cols_folding = ui.toggle_button(label='Columns folding',
#                                     left_value='Fold',
#                                     right_value='Unfold',
#                                     index=1
#                                     )

# row2.table(get_table_data(audios), {
#     'container.hash': lambda val: ui.board_link('run.py', val, state={'hash': val}),
#     'values': lambda val: ui.audios([audios[int(val)]])
# })
