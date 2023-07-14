from asp import FigureSequence

ui.header('Figures')

form = ui.form('Search')
query = form.text_input(value='')

figures_data = FigureSequence.filter(query)

figures_list = ui.figures(figures_data)
