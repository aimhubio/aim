ui.header('ui.json')
ui.text('Display dict as a pretty-printed JSON string.')

ui.subheader('Signature')
ui.code('ui.json(data)')

ui.subheader('Parameters')
ui.table({
    'name': ['data'],
    'type': ['JSON serializable object'],
    'default': [''],
    '': ['The object to print as JSON. All referenced objects should be serializable to JSON as well'],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code("""ui.json({
    'key1': 'value',
    'key2': 10,
    'key3': [0, 1, 2],
    'key4': {
        'nested_key': 'value'
    }
})""")

ui.subheader('Result')
ui.json({
    'key1': 'value',
    'key2': 10,
    'key3': [0, 1, 2],
    'key4': {
        'nested_key': 'value'
    }
})
