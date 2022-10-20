export const initialCode = `from aim.asl.objects import Metric, Images, Audios, Figures, Texts 
from aim.ui.layout import Grid, Cell
from aim.ui.viz import LineChart, ImagesList, AudiosList, FiguresList, TextsList, JSON
import plotly.graph_objects as go

metrics = Metric.query()

fig = go.Figure()
for metric in metrics:
    fig.add_trace(go.Scatter(x=metric["steps"], y=metric["values"],
                    mode='lines',
                    name=metric["run"]["name"]))

figure = FiguresList(fig)

Grid([
    [Cell(figure)]
])
`;
