export const initialCode = `from aim-ui-client import set_layout

metrics = Metric.get('metric.name == "best_loss"')

LineChart = line_chart(data=metrics, x='steps', y='values', 
                facet=["metric.name"], color=["run.name"], 
                stroke_style=["metric.context"])

layout = set_layout([
    [LineChart]
])
`;
