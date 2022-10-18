export const initialCode = `from aim-ui-client import Metric, Image, line_chart, images_list, json, display

metrics = Metric.get()

def on_active_point_change(val, is_active):
    if is_active:
        metric = metrics[val.key]
        run_hash = metric.run.hash

        images = Image.get(f'run.hash == "{run_hash}"')
        Images = images_list(data=images,
                facet={
                    "row": ["record.step"], 
                    "column": ["images.name"]
                })

        audios = Audio.get(f'run.hash == "{run_hash}"')
        Audios = audios_list(data=audios,
                facet={
                    "row": ["record.step"], 
                    "column": ["audios.name"]
                })

        text = Text.get(f'run.hash == "{run_hash}"')
        Texts = text_list(data=text, color=["record.step"],
                facet={
                    "row": ["record.step"], 
                    "column": ["texts.name"]
                })

        JSON = json(metric.run)

        display([
            [LineChart],
            [Images, Audios, Texts]
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
