import random


@memoize
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

line_chart_tab, nivo_line_chart_tab, bar_chart_tab, scatter_plot_tab, parallel_plot_tab = ui.tabs((
    'Line Chart',
    'Nivo Line Chart',
    'Bar Chart',
    'Scatter Plot',
    'Parallel Plot'
))

line_chart_tab.line_chart(
    data,
    x='x',
    y='y',
    color=['name']
)

line_chart = nivo_line_chart_tab.nivo_line_chart(
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


def generate_parallel_plot_data(num_lines: int = 100, dimensions: list[str] = []):
    data = []
    for _ in range(num_lines):
        line = {}
        for i, d in enumerate(dimensions):
            start = random.randint(1, 100)
            end = random.randint(start, start + _ * i * 100)
            line[str(d)] = random.randint(start, end)
        data.append({
            'name': 'Line: ' + str(_),
            'values': line,
            'dimensions': dimensions
        })
    return data


# Generate 100 lines (dicts), which include each dimension [key, value] pair
parallel_plot_data = generate_parallel_plot_data(100, [
    'hparams.batch_size',
    'hparams.learning_rate',
    'hparams.num_classes',
    'hparams.num_epochs',
    'CPU',
    'Disk',
    'Memory'
])


parallel_plot = parallel_plot_tab.parallel_plot(
    data=parallel_plot_data,
    dimensions='dimensions',
    values='values',
    color=['name']
)
