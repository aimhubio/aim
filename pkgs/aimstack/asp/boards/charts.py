import random


def generate_data(num_items, values_length):
    data = []
    for _ in range(num_items):
        x_values = [i for i in range(values_length)]
        y_values = [random.randint(1, 10) for _ in range(values_length)]
        data.append({'x': x_values, 'y': y_values, 'name': 'Num_' + str(_)})
    return data


# Generate 5 lines, each with a list of 10 values
data = generate_data(5, 10)

header = ui.header('Aim UI Charts')

line_chart_tab, bar_chart_tab, scatter_plot_tab = ui.tabs(
    ('Line Chart', 'Bar Chart', 'Scatter Plot'))

line_chart = line_chart_tab.nivo_line_chart(
    data,
    x='x',
    y='y',
    color=['name']
)

bar_chart = bar_chart_tab.bar_chart(
    data,
    x='name',
    y='y',
    color=['name']
)

scatter_plot = scatter_plot_tab.scatter_plot(
    data,
    x='x',
    y='y',
    color=['name']
)
