export const initialCode = `metrics = Metric.query('metric.name == "Loss"')

line_chart = LineChart(metrics, x='steps', y='values',
                    color=["run.name"],
                    stroke_style=["metric.context"])

Metric_Explorer = Group(
    line_chart, 
    facet={"row": ["metric.context"], "column": ["run.name"]},
    color=lambda m: "red" if m["context"]["type"] == "duration_loss" else "green",
)

focused_metric = line_chart["focused_line_data"]

if focused_metric != None:
    images = Images.query(f'run.hash == "{focused_metric["run"]["hash"]}"')
    images_list = ImagesList(images)
    Images_Explorer = Group(
        images_list, 
        facet={"row": ["record.index"], "column": ["record.index"]}
    )
`;
