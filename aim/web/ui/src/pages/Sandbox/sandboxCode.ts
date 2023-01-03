export const initialCode = `metrics = Metric.query()

line_chart = LineChart(metrics, x='steps', y='values',
                    color=["run.name"],
                    stroke_style=["metric.context"])

Metric_Explorer = Group(
    line_chart, 
    facet={"row": ["metric.name"], "column": ["run.name"]},
    size={"width": 400, "height": 300}
)


`;
