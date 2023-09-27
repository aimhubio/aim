from experiment_tracker import TrainingRun

c_hash = session_state.get('container_hash')

if c_hash is None:
    ui.subheader('No run selected')
    ui.board_link('runs.py', 'Explore runs')
    run = None
else:
    run = TrainingRun.find(c_hash)
    if run:
        hash = run.get('hash')
        ui.subheader(f'Run: {hash}')
    else:
        ui.subheader('Run not found')
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
    params_tab, metrics_tab, audios_tab, texts_tab, images_tab, figures_tab = ui.tabs(('Params', 'Metrics', 'Audios',
                                                                                      'Texts', 'Images', 'Figures'))
    with params_tab:
        params = run
        if params is None:
            ui.text('No parameters found')
        else:
            ui.json(params)
    with metrics_tab:
        metrics = ui.board('base:metrics.py', state={'container_hash': c_hash})
    with audios_tab:
        audios = ui.board('base:audios.py', state={'container_hash': c_hash})
    with texts_tab:
        texts = ui.board('base:texts.py', state={'container_hash': c_hash})
    with images_tab:
        images = ui.board('base:images.py', state={'container_hash': c_hash})
    with figures_tab:
        figures = ui.board('base:figures.py', state={'container_hash': c_hash})
