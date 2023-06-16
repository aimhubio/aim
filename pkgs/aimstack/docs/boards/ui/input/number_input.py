ui.header('ui.number_input')
ui.text('Display a number input component.')

ui.subheader('Signature')
ui.code('ui.number_input(label='', value=0, min=None, max=None, step=None, disabled=None)')

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'value', 'min', 'max', 'step', 'disabled'],
    'type': ['str', 'int, float', 'int, float, None', 'int, float, None', 'int, float, None', 'bool'],
    'default': ['""', 0, 'None', 'None', '1 - if the data type of value parameter is int, 0.01 - otherwise' 'False'],
    '': [
        'label of the number input',
        'value of the number input',
        'minimum value of the number input',
        'maximum value of the number input',
        'step size',
        'whether the number input is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['int, float'],
    '': ['The value of the number input component. The return type will match the data type of the value parameter.']
})

ui.subheader('Example')
ui.code("""value = ui.number_input(value=10, min=0, max=100, step=2)
ui.text(f'{value}')""")

value = ui.number_input(value=10, min=0, max=100, step=2)
ui.text(f'{value}')
