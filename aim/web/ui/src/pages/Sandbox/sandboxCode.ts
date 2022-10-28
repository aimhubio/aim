export const initialCode = `from aim.sequences import Metric 
from aim.ui.layout import Grid, Cell
from aim.ui.viz import LineChart, Table

metrics = Metric.query()

def show_dataframe(metric, point):
    metric_df = Metric.dataframe(metric["key"])
    table = Table(metric_df)
    
    Grid([
        [line_chart_cell],
        [Cell(table)]
    ])

line_chart = LineChart(metrics, x='steps', y='values',
                color=["run.name"],
                stroke_style=["metric.context"],
                on_point_click=show_dataframe)

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
