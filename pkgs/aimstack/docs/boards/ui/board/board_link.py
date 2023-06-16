ui.header('ui.board_link')
ui.text('Display a board link component.')

ui.subheader('Signature')
ui.code("ui.board_link(path, text='Go to Board', new_tab=False, state={})")

ui.subheader('Parameters')
ui.table({
    'name': ['path', 'text', 'new_tab', 'state'],
    'type': ['str', 'str', 'bool', 'dict'],
    'default': ['', 'Go to Board', 'False', '{}'],
    '': [
        'the path to the board file',
        'the text of the board link button component',
        'whether open the board in the new tab or not',
        "board's session_state"
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['None'],
    '': ['']
})

ui.subheader('Example')
ui.code("""ui.board_link('ui/data_viz/json.py', 'See "json" component docs', new_tab=True)""")

ui.board_link('ui/data_viz/json.py', 'See "json" component docs', new_tab=True)
