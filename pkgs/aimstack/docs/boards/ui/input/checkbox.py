ui.header('ui.checkbox')
ui.text('Display a checkbox component.')

ui.subheader('Signature')
ui.code("ui.checkbox(label='', checked=False, disabled=False)")

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'checked', 'disabled'],
    'type': ['str', 'bool', 'bool'],
    'default': ['""', 'False', 'False'],
    '': [
        'the label of the checkbox component',
        'the value of the checkbox component',
        'whether the checkbox is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['bool'],
    '': ['Whether the checkbox is checked.']
})

ui.subheader('Example')
ui.code("""ui.checkbox(label='Agree with terms', checked=True)""")

ui.checkbox(label='Agree with terms', checked=True)
