from asp import Run, Metric

if 'hash' in session_state:
    hash = session_state['hash']
else:
    hash = None

@memoize
def memoize_query(cb, query):
    return cb(query)

runs = memoize_query(Run.filter, f'c.hash=="{hash}"')
run = None

if runs:
    run = runs[0]
    ui.subheader(f'Run: {run["hash"]}')
else:
    ui.subheader('No runs found')
    ui.board_link('runs.py', 'Explore runs')

def flatten(dictionary, parent_key='', separator='.'):
    items = []
    for key, value in dictionary.items():
        new_key = parent_key + separator + key if parent_key else key
        if isinstance(value, MutableMapping):
            items.extend(flatten(value, new_key, separator=separator).items())
        else:
            items.append((new_key, value))
    return dict(items)

def merge_dictionaries(dict1, dict2):
    merged_dict = dict1.copy()
    merged_dict.update(dict2)
    return merged_dict

@memoize
def group_metrics_data(metrics=[], group_field='name'):
    grouped_data = {}
    # Group metric data by "group_field"
    for metric in metrics:
        metric_processed = merge_dictionaries(metric, flatten(metric))
        if group_field in metric_processed:
            key = str(metric_processed[group_field])
            if key in grouped_data:
                grouped_data[key].append(metric_processed)
            else:
                grouped_data[key] = [metric_processed]

    return grouped_data.values()


if run:
    params_tab, metrics_tab = ui.tabs(('Params', 'Metrics'))

    with params_tab:
        params = run['params']
        if params:
            ui.json(params)
        else:
            ui.text('No parameters found')

    with metrics_tab:
        metrics = memoize_query(Metric.filter, f'c.hash=="{hash}"')
        if metrics:
            group_field = ui.select('Group by:', ('name', 'context', 'context.subset', 'hash'))
            grouped_data = group_metrics_data(metrics, group_field=group_field)
            ui.html('<br/>')
            x = ui.select('Align by:', ('steps', 'axis.epoch'))
            rows = ui.rows(len(grouped_data))
            for index, grouped_metrics in enumerate(grouped_data):
                row = rows[index]
                row.html('<br/>')
                row.text(f'{group_field}: {grouped_metrics[0][group_field]}')
                row.line_chart(grouped_metrics, x=x, y='values', color=['name'])
        else:
            ui.text(f'No metrics found')
