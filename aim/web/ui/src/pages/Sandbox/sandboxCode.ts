export const initialCode = `from aim.sequences import Metric 
from aim.ui.layout import Grid, Cell
from aim.ui.viz import LineChart, Table
from hrepr import H

metrics = Metric.query()

def on_click(metric, point):
    html = H.span()
    html = html("Only ")
    html = html(H.b("YOU", style="color: brown;"), " can prevent forest fires!")
    html = HTML(html)
    
    Grid([
        [line_chart_cell],
        [Cell(html)]
    ])

line_chart = LineChart(metrics, x='steps', y='values',
                color=["run.name"],
                stroke_style=["metric.context"],
                on_point_click=on_click)

line_chart_cell = Cell(
                    line_chart, 
                    facet={
                        "row": ["metric.name"], 
                        "column": ["run.name"]
                    })

Grid([
    [line_chart_cell],
    []
])
`;
