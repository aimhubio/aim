# Header
ui.header('Header')

# Subheader
ui.subheader('Subheader')

# Text element
ui.text('This is a text element')

# JSON
ui.text('JSON')
ui.json({
    'key1': 'value',
    'key2': 10,
    'key3': [0, 1, 2],
    'key4': {
        'nested_key': 'value'
    }
})

# Table
ui.text('Table')
ui.table({
    'col1': [0, 1, 2],
    'col2': [3, 4, 5],
    'col3': [6, 7, 8]
})

ui.text('Table with custom column renderer')
ui.table({
    'col1': [0, 1, 2],
    'col2': [3, 4, 5],
    'col3': [6, 7, 8]
}, {
    'col1': lambda val: ui.number_input(value=val),
})

# HTML
ui.html('<p>This is <strong style="color: #396">HTML</strong> renderer!</p>')

# Link
ui.link('External link to Aim GitHub page',
        'https://github.com/aimhubio/aim', new_tab=True)

# Code block
ui.code("""# This is a code block
from aim import Metric

metric = Metric.filter()

ui.line_chart(metric, x='steps', y='values')""")
