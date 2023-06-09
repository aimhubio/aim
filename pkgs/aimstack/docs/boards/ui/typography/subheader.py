ui.board(
    'ui/ui_component_doc_template.py',
    state={
        'header': 'ui.subheader',
        'description': 'Display text in subheader formatting',
        'signature': 'ui.subheader(text)',
        'parameters': {
            'name': ['text'],
            'type': ['str'],
            'default': ['""'],
            '': ['the text value to be rendered as a subheader'],
        },
        'example': """ui.subheader('Subheader')""",
        'renderer': lambda: ui.subheader('Subheader'),
    }
)
