ui.header('ui.form')
ui.text("A form is a container that visually groups other elements and widgets together, and contains a Submit button. When the form's Submit button is pressed, all elements values inside the form will be appliead to the board's state.")
ui.text('To add elements to the returned container, you can use "with" notation or just call methods directly on the returned object.')

ui.subheader('Signature')
ui.code("ui.form(submit_button_label='Submit')")

ui.subheader('Parameters')
ui.table({
    'name': ['submit_button_label'],
    'type': ['str'],
    'default': ['Submit'],
    '': ['Submit button text content.'],
})

ui.subheader('Returns')
ui.table({
    'type': ['container object'],
    '': ['A container object.']
})

ui.subheader('Example')
ui.code("""form = ui.form('Apply')

with form:
    val = ui.text_input(value='value')

ui.text('The value below will be updated only after pressing the Apply button.')
ui.text(val)""")

form = ui.form('Apply')

with form:
    val = ui.text_input(value='value')

ui.text('The value below will be updated only after pressing the Apply button.')
ui.text(val)
