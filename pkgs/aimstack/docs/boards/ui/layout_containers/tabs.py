ui.header('ui.tabs')
ui.text('Inserts a number of multi-element containers as tabs. Tabs are a navigational element that allows users to easily move between groups of related content.')
ui.text('To add elements to the returned containers, you can use "with" notation or just call methods directly on the returned object.')

ui.subheader('Signature')
ui.code("ui.columns(tabs)")

ui.subheader('Parameters')
ui.table({
    'name': ['tabs'],
    'type': ['List[str]'],
    'default': [''],
    '': ['Creates a tab for each string in the list. The first tab is selected by default. The string is used as the name of the tab.'],
})

ui.subheader('Returns')
ui.table({
    'type': ['(list of containers)'],
    '': ['A list of container objects.']
})

ui.subheader('Example')
ui.code("""tab1, tab2, tab3 = ui.tabs(('Tab 1', 'Tab 2', 'Tab 3'))

with tab1:
    ui.line_chart([{'x': [0, 1, 2], 'y': [0, 1, 2]}], x='x', y='y')

with tab2:
    ui.json({
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3',
    })

tab3.table({
    'col1': [0, 1, 2],
    'col2': [3, 4, 5],
    'col3': [6, 7, 8],
})""")

tab1, tab2, tab3 = ui.tabs(('Tab 1', 'Tab 2', 'Tab 3'))

with tab1:
    ui.line_chart([{'x': [0, 1, 2], 'y': [0, 1, 2]}], x='x', y='y')

with tab2:
    ui.json({
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3',
    })

tab3.table({
    'col1': [0, 1, 2],
    'col2': [3, 4, 5],
    'col3': [6, 7, 8],
})
