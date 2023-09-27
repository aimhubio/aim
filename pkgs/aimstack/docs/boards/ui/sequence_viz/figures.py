ui.header('ui.figures')
ui.text('Display an figures list component.')

ui.subheader('Signature')
ui.code("ui.figures(data)")

ui.subheader('Parameters')
ui.table({
    'name': ['data'],
    'type': ['List[dict]'],
    'default': ['', '{}'],
    '': [
        'The data for the FiguresList component'
    ],
})

ui.subheader('Example')
ui.code("""from base import Figures

figures = Figures.filter()

ui.figures(images)""")
