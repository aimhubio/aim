export const initialCode = `#####
# Filter data with a query condition 
# Example
metrics = Repo.filter('metric', 'metric.name == "loss"')
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
if line_chart.active_line:
    run = line_chart.active_line["run"]
    JSON(run)
#####
`;
