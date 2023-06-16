ui.header('ui.board')
ui.text('Embed a board inside another board.')

ui.subheader('Signature')
ui.code("ui.board(path, state={})")

ui.subheader('Parameters')
ui.table({
    'name': ['path', 'state'],
    'type': ['str', 'dict'],
    'default': ['', '{}'],
    '': [
        'the path to the board file',
        "board's session_state"
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['None'],
    '': ['']
})

ui.subheader('Example')
ui.code("""ui.board('ui/data_viz/json.py')""")

ui.board('ui/data_viz/json.py')
