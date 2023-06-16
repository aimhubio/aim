ui.header('ui.code')
ui.text('Display a string as a code block.')

ui.subheader('Signature')
ui.code('ui.code(text, language="python")')

ui.subheader('Parameters')
ui.table({
    'name': ['text', 'language'],
    'type': ['str', 'str'],
    'default': ['""', 'python'],
    '': ['the text of the code component', 'the language of the code component'],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code('ui.code("print("Hello World!")")')

ui.subheader('Result')
ui.code('print("Hello World!")')
