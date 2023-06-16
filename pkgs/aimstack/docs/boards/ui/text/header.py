ui.header('ui.header')
ui.text('Display text in header formatting.')

ui.subheader('Signature')
ui.code('ui.header(text)')

ui.subheader('Parameters')
ui.table({
    'name': ['text'],
    'type': ['str'],
    'default': ['""'],
    '': ['the text value to be rendered as a header'],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code('ui.header("Header")')

ui.subheader('Result')
ui.header('Header')
