ui.header('ui.columns')
ui.text('Inserts a number of multi-element containers laid out side-by-side and returns a list of container objects.')
ui.text('To add elements to the returned containers, you can use "with" notation or just call methods directly on the returned object.')
ui.text('Should always be used in conjunction with other containers (e.g. rows).')

ui.subheader('Signature')
ui.code("ui.columns(count)")

ui.subheader('Parameters')
ui.table({
    'name': ['count'],
    'type': ['int'],
    'default': [''],
    '': ['An integer that specifies the number of columns. All columns have equal width.'],
})

ui.subheader('Returns')
ui.table({
    'type': ['(list of containers)'],
    '': ['A list of container objects.']
})

ui.subheader('Example')
ui.code("""row, = ui.rows(1)

col1, col2 = row.columns(2)

with col1:
    ui.header('Column 1')
    ui.text('Some text in column 1')

col2.header('Column 2')
col2.text('Some text in column 2')""")

row, = ui.rows(1)

col1, col2 = row.columns(2)

with col1:
    ui.header('Column 1')
    ui.text('Some text in column 1')

col2.header('Column 2')
col2.text('Some text in column 2')
