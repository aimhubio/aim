from asp import Metric

header = ui.header('Aim UI Charts')

subheader = ui.subheader('Line Chart')

# Create a metric object
metrics = Metric.filter('')

nivo_line_chart = ui.nivo_line_chart(metrics, x='steps', y='values')
