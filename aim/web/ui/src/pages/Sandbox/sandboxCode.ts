export const initialCode = `#####
# Filter data with a query condition 
# Example
metrics = Metric.query('metric.name == "loss"')
#####

#####
# Render your data with viz component
# Example
line_chart = LineChart(metrics, x='steps', y='values',
                   color=["run.name"],
                   stroke_style=["metric.context"])
#####

#####
# Use component state to make your board interactive
# Example
if line_chart["focused_line_data"] != None:
    run = line_chart["focused_line_data"]["run"]
    JSON(run)
#####
`;
