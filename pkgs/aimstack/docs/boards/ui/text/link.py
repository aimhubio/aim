ui.header('ui.link')
ui.text('Display a text as a hyperlink.')

ui.subheader('Signature')
ui.code('ui.link(text, to, new_tab=False)')

ui.subheader('Parameters')
ui.table({
    'name': ['text', 'to', 'new_tab'],
    'type': ['str', 'str', 'bool'],
    'default': ['', '', 'False'],
    '': ['the text of the link component', 'the navigation path of the link component', 'whether to open the link in a new tab or not'],
})

# ui.subheader('Returns')
# ui.table({})

ui.subheader('Example')
ui.code('ui.link("Explorers", "/explorers", True)')

ui.subheader('Result')
ui.link("Explorers", "/explorers", True)
