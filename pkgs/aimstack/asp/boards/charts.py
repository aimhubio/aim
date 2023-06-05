from asp import Metric
import random


def generate_data(num_items, values_length):
    data = []
    for _ in range(num_items):
        x_values = [i for i in range(values_length)]
        y_values = [random.randint(0, 10) for _ in range(values_length)]
        data.append({'x': x_values, 'y': y_values, 'name': 'Line ' + str(_)})
    return data


# Generate 5 lines, each with a list of 10 values
data = generate_data(5, 10)

header = ui.header('Aim UI Charts')

subheader = ui.subheader('Line Chart')

# Create a metric object
metrics = Metric.filter('')

nivo_line_chart = ui.nivo_line_chart(
    data,
    x='x',
    y='y',
    color=['name']
)
