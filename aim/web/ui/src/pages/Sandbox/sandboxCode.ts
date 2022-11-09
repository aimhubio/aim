export const initialCode = `from aim.sequences import Metric 
from aim.ui.layout import Cell
from aim.ui.viz import LineChart, Table, JSON

metrics = Metric.query()

def render(state, set_state):
    line_chart = LineChart(metrics, x='steps', y='values',
                    color=["run.name"],
                    stroke_style=["metric.context"],
                    set_state=set_state)

    line_chart_cell = Cell(line_chart)

    table_cell = None
    params_cell = None

    if state != None and "focused_line_data" in state.keys():
        metric = state["focused_line_data"]
        metric_df = Metric.dataframe(metric["key"])
        table_cell = Cell(Table(metric_df))
        params_cell = Cell(JSON(metric["run"]))

    return [
        [line_chart_cell],
        [table_cell, params_cell]
    ]
`;
