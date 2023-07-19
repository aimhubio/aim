ui.header('ui.radio')
ui.text('Display a group of radio elements.')

ui.subheader('Signature')
ui.code("ui.radio(label='', options=('option 1', 'option 2'), index=0, orientation='vertical', disabled=False)")

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'options', 'index', 'orientation', 'disabled'],
    'type': ['str', 'tuple[str]', 'number', "str: 'vertical' | 'horizontal'", 'bool'],
    'default': ['""', "('option 1', 'option 2')", '0', 'vertical', 'False'],
    '': [
        'the label of the radio component',
        'the options for radio component',
        "the default selected opion's index",
        'the orientation of the radio component',
        'whether the radio is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['str'],
    '': ['The selected option of the radio component. This will be cast to str internally.']
})

ui.subheader('Example')
ui.code("""value = ui.radio(
    label='Select input type', 
    options=('text', 'number'), 
    index=0, 
    orientation='horizontal', 
    disabled=False
)

if value == 'text':
    ui.text_input(value='text input')
else:
    ui.number_input(value=1)""")

value = ui.radio(
    label='Select input type',
    options=('text', 'number'),
    index=0,
    orientation='horizontal',
    disabled=False
)

if value == 'text':
    ui.text_input(value='text input')
else:
    ui.number_input(value=1)
