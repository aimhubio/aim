export const initialCode = `metrics = Metric.query('metric.name == "loss"')

line_chart = LineChart(metrics, x='steps', y='values',
                    color=["run.name"],
                    stroke_style=["metric.context"])

if line_chart["focused_line_data"] != None:
    run = line_chart["focused_line_data"]["run"]
    JSON(run)
`;
