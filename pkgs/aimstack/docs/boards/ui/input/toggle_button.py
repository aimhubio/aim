ui.header('ui.toggle_button')
ui.text('Display a toggle button component.')

ui.subheader('Signature')
ui.code("ui.toggle_button(left_value='On', right_value='Off', index=0, disabled=None)")

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'left_value', 'right_value', 'index', 'disabled'],
    'type': ['str', 'str', 'str', 'number', 'bool'],
    'default': ['""', 'On', 'Off', 0, 'False'],
    '': [
        'the label of the toggle button component',
        'the left value of the toggle button component',
        'the right value of the toggle button component',
        'the selected index of the toggle button component',
        'whether the toggle button is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['str'],
    '': ['The selected value of the toggle button component. .']
})

ui.subheader('Example')
ui.code("""value = ui.toggle_button(
	label='Sorting order',
	left_value='Asc', 
	right_value='Desc', 
	index=1
)
ui.text(f'Sort list in {value.lower()} order')""")

value = ui.toggle_button(
    label='Sorting order',
    left_value='Asc',
    right_value='Desc',
    index=1
)
ui.text(f'Sort list in {value.lower()}ending order')
