ui.header('ui.rows')
ui.text('Inserts a number of multi-element containers laid out under each other and returns a list of container objects.')
ui.text('To add elements to the returned containers, you can use "with" notation or just call methods directly on the returned object.')
ui.text('Child elements rendered in a row will appear side-by-side.')

ui.subheader('Signature')
ui.code("ui.rows(count)")

ui.subheader('Parameters')
ui.table({
    'name': ['count'],
    'type': ['int'],
    'default': [''],
    '': ['An integer that specifies the number of rows.'],
})

ui.subheader('Returns')
ui.table({
    'type': ['(list of containers)'],
    '': ['A list of container objects.']
})

ui.subheader('Example')
ui.code("""row1, row2 = ui.rows(2)

with row1:
    ui.header('Row 1')
    ui.text('Some text in row 1')

row2.header('Row 2')
row2.text('Some text in row 2')""")

row1, row2 = ui.rows(2)

with row1:
    ui.header('Row 1')
    ui.text('Some text in row 1')

row2.header('Row 2')
row2.text('Some text in row 2')
