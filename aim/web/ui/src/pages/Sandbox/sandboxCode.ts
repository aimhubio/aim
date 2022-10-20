export const initialCode = `from aim-ui-client import Grid, GridCell, Metric, Image, Audio, Text, line_chart, images_list, audios_list, text_list, json

metrics = Metric.get()
# texts = Text.get()

LineChart = line_chart(metrics, x='steps', y='values',
                color=["run.name"],
                stroke_style=["metric.context"])

# TextList = text_list(texts, color=["record.step"])

RunsList = GridCell([LineChart])

Grid([
    [RunsList]
])
`;
