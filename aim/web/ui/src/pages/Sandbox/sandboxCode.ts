export const initialCode = `from aim-ui-client import Metric, Image, line_chart, images_list, display, update_layout

metrics = Metric.get()

def on_active_point_change(val, is_active):
    if is_active:
        metric = metrics[val.key]
        run_hash = metric.run.hash

        images = Image.get(f'run.hash == "{run_hash}"')
        Images = images_list(data=images)

        update_layout([
            [LineChart],
            [Images]
        ])

LineChart = line_chart(data=metrics, x='steps', y='values', 
                facet=["metric.name"], color=["run.name"],
                callbacks={"on_active_point_change": on_active_point_change})

layout = display([
    [LineChart],
    []
])
`;
