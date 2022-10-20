export const initialCode = `from aim-ui-client import Grid, GridCell, Metric, Image, Audio, Text, get_runs, line_chart, images_list, audios_list, text_list, json

metrics = Metric.get()

def on_click(val, is_active):
    if is_active:
        run = metrics[val.key]["run"]
        Grid([
            [GridCell(LineChart)],
            [GridCell(json(run))]
        ])

LineChart = line_chart(metrics, x='steps', y='values',
                color=["run.name"],
                stroke_style=["metric.context"],
                callbacks={"on_active_point_change": on_click})

Grid([
    [GridCell(LineChart)]
])
`;
