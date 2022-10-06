export const initialCode = `from aim-ui-client import metrics
import pandas as pd
from datetime import datetime

lines = [[]]
df_source = {
  "run.name": [],
  "metric.name": [],
  "metric.context": [],
  "epoch": [],
  "step": [],
  "value": [],
  "date": []
}

metrics_list = []

# smoothing section
def calc_ema(values, factor):
  if len(values) < 2:
    return values
  smoothed = [values[0]]
  for i, _ in enumerate(values[1:], start=1):
    smoothed.append(smoothed[i - 1] * factor + values[i] * (1 - factor))
  return smoothed

# map metrics to lines (charts)
for i, metric in enumerate(metrics):
  # set chart facet
  if metric.name in metrics_list:
    chart_index = metrics_list.index(metric.name)
  else:
    chart_index = len(metrics_list)
    metrics_list.append(metric.name)
  if chart_index >= len(lines):
    lines.append([])
  # add line
  lines[chart_index].append({
    "key": i,
    "data": {
      "xValues": metric.steps,
      # apply smoothing only on bleu metrics
      "yValues": calc_ema(list(metric.values), 0.6)
    },
    # set line color
    "color": f'rgb({(i * 3 + 50) % 200}, {(i * 5 + 100) % 200}, {(i * 7 + 150) % 200})',
    # set line stroke style 
    "dasharray": "0" if metric.context.subset == "val" else "5 5"
  })
  # add dataframe rows
  for i, s in enumerate(metric.steps):
    df_source["run.name"].append(metric.run.name)
    df_source["metric.name"].append(metric.name)
    df_source["metric.context"].append(repr(metric.context.to_py()))
    df_source["epoch"].append(metric.epochs[i])
    df_source["step"].append(metric.steps[i])
    df_source["value"].append(metric.values[i])
    df_source["date"].append(datetime.fromtimestamp(metric.timestamps[i]).strftime('%d-%m-%y %H:%M:%S'))

def on_active_point_change(val, is_active):
  if is_active:
    metric = metrics[val.key]
    point_index = list(metric.steps).index(val.xValue)
    d = {
      "run.name": metric.run.name,
      "metric.name": metric.name,
      "metric.context": repr(metric.context.to_py()),
      "step": list(metric.steps)[point_index],
      "value": list(metric.values)[point_index]
    }
    print(pd.DataFrame(d, index=[val.key]))

layout = {
  "linechart": {
    "data": lines,
    "callbacks": {
      "on_active_point_change": on_active_point_change
    }
  },
  "dataframe": {
    "data": pd.DataFrame(df_source).to_json(orient='records')
  }
}
`;
