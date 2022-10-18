export const initialCode = `from aim-ui-client import Metric, Image, line_chart, images_list, json, display

metrics = Metric.get()

def on_active_point_change(val, is_active):
    if is_active:
        metric = metrics[val.key]
        run_hash = metric.run.hash

        images = Image.get(f'run.hash == "{run_hash}"')
        Images = images_list(data=images)

        JSON = json(metric.run)

        display([
            [LineChart],
            [Images, JSON]
        ])

LineChart = line_chart(metrics, x='steps', y='values',
                color=["run.name"],
                stroke_style=["metric.context"],
                facet={
                    "row": ["metric.name"], 
                    "column": ["run.name"]
                },
                callbacks={"on_active_point_change": on_active_point_change})

display([
    [LineChart],
    []
])
`;
