ui.header('ui.text')
ui.text('Write a text into the board.')

ui.subheader('Signature')
ui.code('ui.text(text)')

ui.subheader('Parameters')
ui.table({
    'name': ['text'],
    'type': ['str'],
    'default': ['""'],
    '': ['the text value to be rendered'],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code('ui.text("This is a text element")')

ui.subheader('Result')
ui.text("This is a text element")
