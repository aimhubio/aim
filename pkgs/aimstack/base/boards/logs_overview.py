import json
from collections import defaultdict

from base import get_project_stats, get_sequence_type_preview, get_container_type_preview

project_stats = get_project_stats()

container_info = project_stats['containers']
sequence_info = project_stats['sequences']

row, = ui.rows(1)

col1, col2 = row.columns(2)

col1.header('Containers Overview')


cont_table = col1.table({
    'type': list(container_info.keys()),
    'count': list(container_info.values())
})

col2.header('Sequences Overview')

seq_table = col2.table({
    'type': list(sequence_info.keys()),
    'count': list(sequence_info.values())
})


def container_info_table(cont_infos):
    table_data = defaultdict(list)
    for i, cont_info in enumerate(cont_infos):
        for key, val in cont_info.items():
            if len(table_data[key]) < i:
                table_data[key].extend([None] * (i - len(table_data[key])))
            table_data[key].append(f'{val}')
    return table_data


def sequence_info_table(seq_infos):
    seq_types = []
    seq_full_types = []
    names = []
    container_hashes = []
    contexts = []
    item_types = []
    axis_names = []
    ranges = []
    for seq_info in seq_infos:
        seq_types.append(seq_info['sequence_type'])
        seq_full_types.append(seq_info['sequence_full_type'])
        container_hashes.append(seq_info['hash'])
        names.append(seq_info['name'])
        contexts.append(seq_info['context'])
        item_types.append(seq_info['value_type'])
        axis_names.append(', '.join(seq_info['axis_names']))
        ranges.append(f"[{seq_info['range'][0]}, {seq_info['range'][1]}]")
    return {
        'hash': container_hashes,
        'name': names,
        'context': contexts,
        'sequence_type': seq_types,
        'sequence_full_type': seq_full_types,
        'value_type': item_types,
        'axis_names': axis_names,
        'range': ranges
    }


selected_cont_type = cont_table.focused_row
if selected_cont_type is not None:
    cont_type = selected_cont_type['type']
    ui.header(f'Containers of type \'{cont_type}\'')
    cont_infos = get_container_type_preview(type_=cont_type)
    row, = ui.rows(1)
    cont_type_table = row.table(container_info_table(cont_infos), {
        'hash': lambda val: ui.board_link('run.py', val, state={'container_hash': val})
    })

    selected_cont = cont_type_table.focused_row
    if selected_cont is not None:
        container_hash = selected_cont['hash']
        row.json(Container.find(container_hash))
else:
    ui.text('Select Container type to see details.')

selected_seq_type = seq_table.focused_row
if selected_seq_type is not None:
    seq_type = selected_seq_type['type']
    ui.header(f'Sequences of type \'{seq_type}\'')
    seq_infos = get_sequence_type_preview(type_=seq_type)
    row, = ui.rows(1)
    seq_type_table = row.table(sequence_info_table(seq_infos), {
        'hash': lambda val: ui.board_link('run.py', val, state={'container_hash': val}),
        'context': lambda val: ui.text(json.dumps(val))
    })
    selected_seq = seq_type_table.focused_row
    if selected_seq is not None:
        container_hash = selected_seq['hash']
        name = selected_seq['name']
        context = selected_seq['context']
        row.json(Sequence.find(container_hash, name, context))
else:
    ui.text('Select Sequence type to see details.')
