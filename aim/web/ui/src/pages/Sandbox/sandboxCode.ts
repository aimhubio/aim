export const initialCode = `from aim-ui-client import Metric, line_chart, display

metrics = Metric.get()

LineChart = line_chart(data=metrics, x='steps', y='values', 
                facet=["metric.name"], color=["run.name"], 
                stroke_style=["metric.context"])

layout = display([
    [LineChart]
])
`;
