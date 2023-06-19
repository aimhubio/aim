ui.header('ui.markdown')
ui.text('Display a string in markdown formatting.')

ui.subheader('Signature')
ui.code('ui.markdown(text)')

ui.subheader('Parameters')
ui.table({
    'name': ['text'],
    'type': ['str'],
    'default': [''],
    '': ['markdown string to be rendered'],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code('ui.markdown("*Italics* and **bold**")')

ui.subheader('Result')
ui.markdown("*Italics* and **bold**")
