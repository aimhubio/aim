export const initialCode = `from aim.sequences import Metric 
from aim.ui.layout import Grid, Cell
from aim.ui.viz import LineChart, Table
from hrepr import H

metrics = Metric.query()

def on_click(metric, point):
    html = H.span()
    html = html(H.div("Run: ", H.b(f'{metric["run"]["hash"]}', style="color: blue;")))
    html = html(H.div("metric: ", H.b(f'{metric["name"]}', style="color: blue;")))

    html = HTML(html)
    
    Grid([
        [metrics_explorer],
        [html]
    ])

line_chart = LineChart(metrics, x='steps', y='values',
                color=["run.name"],
                stroke_style=["metric.context"],
                on_point_click=on_click)

metrics_explorer = Group(
                    line_chart, 
                    facet={
                        "row": ["metric.name"], 
                        "column": ["run.name"]
                    })

Grid([
    [metrics_explorer],
    []
])

`;
