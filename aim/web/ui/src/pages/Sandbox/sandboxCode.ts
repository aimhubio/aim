export const initialCode = `from aim.sequences import Metric, Images, Audios, Figures, Texts 
from aim.ui.layout import Grid, Cell
from aim.ui.viz import LineChart, ImagesList, AudiosList, FiguresList, TextsList, JSON
import pandas as pd
from bisect import bisect_left

metrics = Metric.query()

fixed_metrics = []
df_source = {
    "interaction_status": [None],
    "run.hash": [None],
    "metric.name": [None],
    "metric.context": [None],
    "step": [None],
    "value": [None]
}

def add_to_dataframe(metric, point):
    fixed_metrics.append(metric)
    point_index = list(metric["steps"]).index(point["xValue"])
    
    df_source["interaction_status"].append("pinned line")
    df_source["run.hash"].append(metric["run"]["hash"])
    df_source["metric.name"].append(metric["name"])
    df_source["metric.context"].append(str(metric["context"]))
    df_source["step"].append(metric["steps"][point_index])
    df_source["value"].append(metric["values"][point_index])

    df = pd.DataFrame(df_source, index=[0] if len(fixed_metrics) is 0 else None)

    table = Table(df)
    Grid([
        [line_chart_cell],
        [Cell(table)]
    ])

def update_value_col(metric, point):
    point_index = list(metric["steps"]).index(point["xValue"])
    
    df_source["interaction_status"][0] = "hovered line"
    df_source["run.hash"][0] = metric["run"]["hash"]
    df_source["metric.name"][0] = metric["name"]
    df_source["metric.context"][0] = str(metric["context"])
    df_source["step"][0] = metric["steps"][point_index]
    df_source["value"][0] = metric["values"][point_index]
    if len(fixed_metrics) > 0:
        for i, m in enumerate(fixed_metrics):
            step = point["xValue"]
            steps = list(m["steps"])
            point_index = bisect_left(steps, step)
            if point_index >= len(steps):
                point_index = -1

            df_source["step"][i] = m["steps"][point_index]
            df_source["value"][i] = m["values"][point_index]
        
    df = pd.DataFrame(df_source, index=[0] if len(fixed_metrics) is 0 else None)

    table = Table(df)
    Grid([
        [line_chart_cell],
        [Cell(table)]
    ])

line_chart = LineChart(metrics, x='steps', y='values',
                color=["run.name"],
                stroke_style=["metric.context"],
                on_point_click=add_to_dataframe,
                on_chart_hover=update_value_col)

df = pd.DataFrame({})

table = Table(df)

line_chart_cell = Cell(line_chart, 
                            facet={
                                "row": ["metric.name"], 
                                "column": ["run.name"]
                                })

Grid([
    [line_chart_cell],
    [Cell(table)]
])
`;
