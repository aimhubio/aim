export const initialCode = `metrics = Metric.query('metric.name in ["loss"]')

line_chart = LineChart(metrics, x='steps', y='values',
                    color=["run.name"],
                    stroke_style=["metric.context"])

if line_chart["focused_line_data"] != None:               
    metric_df = Metric.dataframe(metric["key"])
    Table(metric_df)

`;
