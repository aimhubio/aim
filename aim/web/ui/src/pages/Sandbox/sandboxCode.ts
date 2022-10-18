export const initialCode = `from aim-ui-client import Metric, Image, line_chart, images_list, json, display

metrics = Metric.get()

LineChart = line_chart(metrics, x='steps', y='values', 
                facet={
                    "row": ["metric.name"], 
                    "column": ["run.name"]
                }, 
                color=["run.name"])

display([
    [LineChart]
])
`;
