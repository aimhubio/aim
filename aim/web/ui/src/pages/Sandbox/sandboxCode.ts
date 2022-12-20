export const initialCode = `from aim.sequences import Metric 
from aim.ui.layout import layout, Group
from aim.ui.viz import LineChart, Table

metrics = Metric.query('metric.name == "Loss"')

line_chart = LineChart(metrics, x='steps', y='values',
                    color=["run.name"],
                    stroke_style=["metric.context"])

Metric_Explorer = Group(line_chart, facet={"row": ["metric.context"], "column": ["run.name"]})

focused_metric = line_chart["focused_line_data"]

if focused_metric != None:
    images = Images.query(f'run.hash == "{focused_metric["run"]["hash"]}"')
    images_list = ImagesList(images)
    Images_Explorer = Group(images_list, facet={"row": ["record.index"], "column": ["images.name"]})

    Heterogenous_Explorer = Group([line_chart, images_list], facet={"row": ["record.index"], "column": []}, stack=["record.index"])

`;
