from asp import Metric

# Create a metric object
metrics = Metric.filter('')

linechart = ui.line_chart(metrics, x='steps', y='values')

ui.board('metrics/loss/run.py')
