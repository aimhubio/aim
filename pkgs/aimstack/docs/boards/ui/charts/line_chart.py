ui.header('ui.line_chart')
ui.text('Display a line chart.')

ui.subheader('Signature')
ui.code('ui.line_chart(data, x, y, color=[], stroke_style=[])')

ui.subheader('Parameters')
ui.table({
    'name': ['data', 'x', 'y', 'color', 'stroke_style'],
    'type': ['List[dict]', 'str', 'str', 'List[str]', 'List[str]'],
    'default': ['', '', '', [], []],
    '': [
        'the data to be plotted',
        'the path to the property for the x-axis value',
        'the path to the property for the y-axis value',
        'list of property paths to use for grouping by color',
        'list of property paths to use for grouping by stroke style'
    ],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Examples')
ui.text('Basic usage:')
ui.code("""data = [{
	'key': 0,
    'x': [0, 1, 2, 3],
    'y': [7, 5, 10, 6]
}, {
	'key': 1,
	'x': [0, 1, 2, 3],
    'y': [3, 9, 7, 4]
}]
ui.line_chart(data, 'x', 'y')""")
data = [{
    'key': 0,
    'x': [0, 1, 2, 3],
    'y': [7, 5, 10, 6]
}, {
    'key': 1,
    'x': [0, 1, 2, 3],
    'y': [3, 9, 7, 4]
}]
ui.line_chart(data, 'x', 'y')

ui.text('Use color and stroke style grouping:')
ui.code("""data = [{
	'key': 0,
    'x': [0, 1, 2, 3],
    'y': [7, 5, 10, 6]
}, {
	'key': 1,
	'x': [0, 1, 2, 3],
    'y': [3, 9, 7, 4]
}]
ui.line_chart(data, 'x', 'y', color=["key"], stroke_style=["key"])""")
data = [{
    'key': 0,
    'x': [0, 1, 2, 3],
    'y': [7, 5, 10, 6]
}, {
    'key': 1,
    'x': [0, 1, 2, 3],
    'y': [3, 9, 7, 4]
}]
ui.line_chart(data, 'x', 'y', color=["key"], stroke_style=["key"])
