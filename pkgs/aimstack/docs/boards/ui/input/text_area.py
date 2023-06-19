ui.header('ui.text_area')
ui.text('Display a text area component.')

ui.subheader('Signature')
ui.code("ui.text_area(label='', value='', size='md', resize='none', disabled=False, caption='')")

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'value', 'size', 'resize', 'disabled', 'caption'],
    'type': ['str', 'str', "str: 'md' | 'lg'  | 'sm'", "str: 'none' | 'horizontal' | 'vertical'", 'bool', 'str'],
    'default': ['""', '""', 'md', 'none', 'False', '""'],
    '': [
        'label of the text input',
        'value of the text input',
        'whether the text input is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['str'],
    '': ['The value of the text area component.']
})

ui.subheader('Example')
ui.code("""value = ui.text_area(
    label='Query', 
    value='sequence.name == "Loss"', 
    size='md', 
    resize='vertical'
)""")

value = ui.text_area(
    label='Query',
    value='sequence.name == "Loss"',
    size='md',
    resize='vertical'
)
