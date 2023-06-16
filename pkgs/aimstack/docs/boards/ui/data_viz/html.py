ui.header('ui.html')
ui.text('Display a string in html formatting.')

ui.subheader('Signature')
ui.code('ui.html(text)')

ui.subheader('Parameters')
ui.table({
    'name': ['text'],
    'type': ['str'],
    'default': [''],
    '': ['html string to be rendered'],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code('ui.html("<em>Italics</em> and <strong>bold</strong>")')

ui.subheader('Result')
ui.html('<em>Italics</em> and <strong>bold</strong>')
