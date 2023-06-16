ui.header('ui.text_input')
ui.text('Display a text input component.')

ui.subheader('Signature')
ui.code('ui.text_input(label='', value='', disabled=False)')

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'value', 'disabled'],
    'type': ['str', 'str', 'bool'],
    'default': ['""', '""', 'False'],
    '': [
        'label of the text input',
        'value of the text input',
        'whether the text input is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['str'],
    '': ['The value of the text input component. This will be cast to str internally.']
})

ui.subheader('Example')
ui.code("""text = ui.text_input(value="text input")
ui.text(text)""")

value = ui.text_input(value="text input")
ui.text(value)
