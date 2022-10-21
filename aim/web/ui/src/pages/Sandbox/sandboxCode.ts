export const initialCode = `from aim.sequences import Metric, Images, Audios, Figures, Texts 
from aim.ui.layout import Grid, Cell
from aim.ui.viz import LineChart, ImagesList, AudiosList, FiguresList, TextsList, JSON

metrics = Metric.query()
images = Images.query()
audios = Audios.query()
texts = Texts.query()

line_chart = LineChart(metrics, x='steps', y='values',
                color=["run.name"],
                stroke_style=["metric.context"])


images_list = ImagesList(images)

audios_list = AudiosList(audios)

text_list = TextsList(texts, color=["record.step"])

runs_table = Cell([line_chart, images_list, audios_list, text_list], 
                facet={"row": ["run.name"], "column": ["type"]})

Grid([
    [runs_table]
])
`;
