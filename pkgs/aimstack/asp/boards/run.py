from asp import Run, Metric
from itertools import groupby
import math

if 'hash' in session_state:
    run_hash = session_state['hash']
else:
    run_hash = None

runs = []
run = None

if run_hash:
    runs = Run.filter(f'c.hash=="{run_hash}"')

if runs:
    run = runs[0]
    ui.subheader(f'Run: {run["hash"]}')
else:
    ui.subheader('No runs found')
    ui.board_link('runs.py', 'Explore runs')


@memoize
def flatten(dictionary, parent_key='', separator='.'):
    flattened = {}
    for key, value in dictionary.items():
        new_key = f"{parent_key}{separator}{key}" if parent_key else key
        if isinstance(value, dict):
            flattened.update(flatten(value, new_key, separator=separator))
        else:
            flattened[new_key] = value
    return flattened


@memoize
def merge_dicts(dict1, dict2):
    merged_dict = dict1.copy()
    merged_dict.update(dict2)
    return merged_dict


if run:
    params_tab, metrics_tab, audios_tab, texts_tab = ui.tabs(
        ('Params', 'Metrics', 'Audios', 'Texts'))
    with audios_tab:
        audios = ui.board('audios.py', state={'container_hash': run_hash})
    with texts_tab:
        texts = ui.board('texts.py', state={'container_hash': run_hash})
    with params_tab:
        params = run['params']
        if params:
            ui.json(params)
        else:
            ui.text('No parameters found')

    with metrics_tab:
        metrics = ui.board('metrics.py', state={'run_hash': run_hash})
