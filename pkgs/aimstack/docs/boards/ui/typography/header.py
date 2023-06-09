ui.board(
    'ui/ui_component_doc_template.py',
    state={
        'header': 'ui.header',
        'description': 'Display text in header formatting',
        'signature': 'ui.header(text)',
        'parameters': {
            'name': ['text'],
            'type': ['str'],
            'default': ['""'],
            '': ['the text value to be rendered as a header'],
        },
        'example': """ui.header('Header')""",
        'renderer': lambda: ui.header('Header'),
    }
)
