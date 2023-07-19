ui.header('ui.table')
ui.text('Display a table component.')

ui.subheader('Signature')
ui.code('ui.table(data, renderer={})')

ui.subheader('Parameters')
ui.table({
    'name': ['data', 'renderer', 'selectable_rows'],
    'type': ['dict', 'dict', 'bool'],
    'default': ['', '{}', 'False'],
    '': [
        'the data of the table component',
        'custom elements as column renderer',
        'whether rows are selectable or not, if True renders a column with checkboxes'
    ],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code("""ui.table({
    "x": [0, 1, 2],
    "y": [3, 4, 5],
})""")

ui.subheader('Result')
ui.table({
    "x": [0, 1, 2],
    "y": [3, 4, 5],
})
