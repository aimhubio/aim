ui.header('ui.select')
ui.text('Display a select component.')

ui.subheader('Signature')
ui.code("ui.select(label='', options=('option 1', 'option 2'), index=0, disabled=False)")

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'options', 'index', 'disabled'],
    'type': ['str', 'tuple[str]', 'number', 'bool'],
    'default': ['""', ('option 1', 'option 2'), 0, 'False'],
    '': [
        'label of the select',
        'select options',
        "the default selected option's index",
        'whether the select is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['str'],
    '': ['The selected option of the select component. This will be cast to str internally.']
})

ui.subheader('Example')
ui.code("""value = ui.select(
    label="Select an option",
    options=('option 1', 'option 2', 'option 3')
)
ui.text(f'Selected: {value}')""")

value = ui.select(
    label="Select an option",
    options=('option 1', 'option 2', 'option 3')
)
ui.text(f'Selected: {value}')
