ui.header('ui.multi_select')
ui.text('Display a multi select componentt.')

ui.subheader('Signature')
ui.code(
    "ui.multi_select(label='', options=('option 1', 'option 2'), index=[0], disabled=False)")

ui.subheader('Parameters')
ui.table({
    'name': ['label', 'options', 'index', 'disabled'],
    'type': ['str', 'tuple[str]', 'list[int]', 'bool'],
    'default': ['""', ('option 1', 'option 2'), 'None', 'False'],
    '': [
        'label of the multi select',
        'select options',
        "the default selected option's indices",
        'whether the multi select is disabled'
    ],
})

ui.subheader('Returns')
ui.table({
    'type': ['list[str]'],
    '': ['The selected values of the multi select component. The values will be cast to str internally.']
})

ui.subheader('Example')
ui.code("""values = ui.multi_select(
		label='Select multiple options',
    options=('option 1', 'option 2', 'option 3'),
    index=[0]
)
text = 'Selcted: '
for val in values:
    text += f'{val}, '

ui.text(text)""")

values = ui.multi_select(
    label='Select multiple options',
    options=('option 1', 'option 2', 'option 3'),
)
text = 'Selcted: '
for val in values:
    text += f'{val}, '

ui.text(text)
