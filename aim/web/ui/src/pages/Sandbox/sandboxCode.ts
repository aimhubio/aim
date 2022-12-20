export const initialCode = `from aim.sequences import Metric 
from aim.ui.layout import layout, Group
from aim.ui.viz import LineChart, Table

metrics = Metric.query('metric.name == "Loss"')
images = Images.query()

images_list = ImagesList(images)

line_chart = LineChart(metrics, x='steps', y='values',
                    color=["run.name"],
                    stroke_style=["metric.context"])

explorer = Group([line_chart, images_list], facet={"row": ["metric.context"], "column": ["run.name"]})

layout([[line_chart, None], [explorer]])
`;
