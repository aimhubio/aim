ui.header('ui.switch')
ui.text('Display a switch component.')

ui.subheader('Signature')
ui.code("ui.switch(label='', checked=False, size='md', disabled=False)")

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'checked', 'size', 'disabled'],
    'type': ['str', 'bool', "str: 'sm' | 'md' | 'lg'", 'bool'],
    'default': ['""', False, 'md', 'False'],
    '': [
        'label of the switch',
        'whether the switch is checked',
        "the size of the switch component",
        'whether the switch is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['bool'],
    '': ['The checked value of the switch component.']
})

ui.subheader('Example')
ui.code("""value = ui.switch(
    label='Turn on', 
    checked=True, 
    size='lg'
)
ui.text(f'Turn: {"on" if value else "off"}')""")

value = ui.switch(
    label='Turn on',
    checked=True,
    size='lg'
)
ui.text(f'Turn {"on" if value else "off"}')
