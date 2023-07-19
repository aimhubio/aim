ui.header('ui.subheader')
ui.text('Display text in subheader formatting.')

ui.subheader('Signature')
ui.code('ui.subheader(text)')

ui.subheader('Parameters')
ui.table({
    'name': ['text'],
    'type': ['str'],
    'default': ['""'],
    '': ['the text value to be rendered as a subheader'],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code('ui.subheader("Subheader")')

ui.subheader('Result')
ui.subheader('Subheader')
