ui.header('ui.slider')
ui.text('Display a slider component.')

ui.subheader('Signature')
ui.code('ui.slider(label="", value=10, min=0, max=100, step=None, disabled=False)')

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'value', 'min', 'max', 'step', 'disabled'],
    'type': ['str', 'int, float', 'int, float', 'int, float', 'int, float, None', 'bool'],
    'default': ['""', 10, 0, 100, '1 - if the data type of value parameter is int, 0.01 - otherwise', 'False'],
    '': [
        'label of the slider',
        'initial value',
        'minimum value',
        'maximum value',
        'step size',
        'whether the slider is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['int, float'],
    '': ['The current value of the slider component. The return type will match the data type of the value parameter.']
})

ui.subheader('Example')
ui.code("""value = ui.slider(value=10, min=-100, max=100, step=2)
ui.text(f'Value is: {value}')""")

value = ui.slider(value=10, min=-100, max=100, step=2)
ui.text(f'Value is: {value}')
