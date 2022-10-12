export const initialCode = `from aim-ui-client import metrics, set_layout

LineChart = line_chart(data=metrics, x='steps', y='values', 
                facet=["metric.name"], color=["run.name"], 
                stroke_style=["metric.context"])

layout = set_layout([
    [LineChart]
])
`;
