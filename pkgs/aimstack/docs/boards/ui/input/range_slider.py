ui.header('ui.range_slider')
ui.text('Display a range slider component.')

ui.subheader('Signature')
ui.code('ui.range_slider(label='', value=(0, 10), min=0, max=100, step=None, disabled=False)')

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'value', 'min', 'max', 'step', 'disabled'],
    'type': ['str', 'tuple[int/float, …]', 'int, float', 'int, float', 'int, float, None', 'bool'],
    'default': ['""', '(0, 10)', 0, 100, '1 - if the data type of value parameter is int, 0.01 - otherwise', 'False'],
    '': [
        'label of the range slider',
        'initial value',
        'minimum value',
        'maximum value',
        'step size',
        'whether the slider is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['tuple[int/float, …]'],
    '': ['The current value of the range slider component. The return type will match the data type of the value parameter.']
})

ui.subheader('Example')
ui.code("""start, end = ui.range_slider(value=(10, 50), min=0, max=100, step=2)
ui.text(f'start={start}, end={end}')""")

start, end = ui.range_slider(value=(10, 50), min=0, max=100, step=2)
ui.text(f'start={start}, end={end}')
