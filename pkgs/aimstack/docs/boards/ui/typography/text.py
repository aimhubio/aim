ui.board(
    'ui/ui_component_doc_template.py',
    state={
        'header': 'ui.text',
        'description': 'Write a text into the board',
        'signature': 'ui.text(text)',
        'parameters': {
            'name': ['text'],
            'type': ['str'],
            'default': ['""'],
            '': ['the text value to be rendered'],
        },
        'example': """ui.text('This is a text element')""",
        'renderer': lambda: ui.text('This is a text element'),
    }
)
