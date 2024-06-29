import json
import os

import click

from aim import Audio, Image, Run
from tqdm import tqdm


def parse_tb_logs(tb_logs, repo_inst, flat=False, no_cache=False):
    """
    This function scans and collects records from TB log files.

    Creates and uses cache file "tb_logs_cache" in the repo dir
    to track previously processed files and values

    For more info please refer to our integration guides.
    """

    try:
        # This import statement takes long to complete
        import tensorflow as tf

        from tensorboard.util import tensor_util
        from tensorflow.python.summary.summary_iterator import summary_iterator
    except ImportError:
        click.echo('Could not process TensorBoard logs - failed to import tensorflow module.', err=True)
        return

    supported_plugins = ('images', 'scalars')
    unsupported_plugin_noticed = False
    tb_logs_cache_path = os.path.join(repo_inst.path, 'tb_logs_cache')

    if no_cache and os.path.exists(tb_logs_cache_path):
        os.remove(tb_logs_cache_path)
    try:
        with open(tb_logs_cache_path) as FS:
            tb_logs_cache = json.load(FS)
    except Exception:
        tb_logs_cache = {}

    def get_parent(current_path, level=0):
        # level 0 is the direct parent directory
        if level <= 0:
            return os.path.dirname(current_path)
        elif current_path in ('', '.', '/'):
            return current_path
        return get_parent(os.path.dirname(current_path), level - 1)

    tb_logs = os.path.abspath(tb_logs)
    run_dir_candidates = set()
    for root, dirs, files in os.walk(tb_logs):
        for file in files:
            if not file.startswith('events.out.tfevents'):
                continue

            file_path = os.path.abspath(os.path.join(root, file))
            run_dir = get_parent(file_path)

            if not run_dir.startswith(tb_logs):
                # it's outside tb_logs
                continue

            run_dir_candidates.add(run_dir)

    def get_level(current_path):
        level = -1
        while current_path.startswith(tb_logs):
            current_path, _ = os.path.split(current_path)
            level += 1
        return level

    def create_ndarray(tensor):
        res = tensor_util.make_ndarray(tensor)
        if res.dtype == 'object':
            return None
        else:
            return res

    run_dir_candidates = sorted(run_dir_candidates, key=get_level, reverse=True)
    run_dir_candidates_filtered = set()
    run_dir_ignored = set()
    groups = set()

    for run_dir in run_dir_candidates:
        if run_dir in run_dir_candidates_filtered:
            # already tagged as a run dir
            continue

        if run_dir in groups:
            # run dir which has other run dirs inside, so we skip it
            run_dir_ignored.add(run_dir)
            continue

        depth = get_level(run_dir)
        if depth >= 2:
            if flat:
                run_group_dir = get_parent(run_dir, 0)
                new_run_dir = run_dir
            else:
                run_group_dir = get_parent(run_dir, 1)
                new_run_dir = get_parent(run_dir, 0)
                if new_run_dir in groups:
                    new_run_dir = run_dir
            groups.add(run_group_dir)
        elif depth == 1:
            new_run_dir = run_dir
        else:
            continue
        run_dir_candidates_filtered.add(new_run_dir)

    if run_dir_ignored:
        click.echo(
            'WARN: Found directory entries with unorganized even files!\n'
            'Please read the preparation instructions to properly process these files.\n'
            'Event files in the following directories will be ignored:',
            err=True,
        )
        for c, r in enumerate(run_dir_ignored, start=1):
            click.echo(f'{c}: {r}', err=True)

    for path in tqdm(
        run_dir_candidates_filtered, desc='Converting TensorBoard logs', total=len(run_dir_candidates_filtered)
    ):
        events = {}
        for root, dirs, files in os.walk(path):
            for file in files:
                if 'events.out.tfevents' not in file:
                    continue
                file_path = os.path.join(root, file)
                if file_path == os.path.join(path, file):
                    entry = None
                else:
                    entry = os.path.basename(os.path.dirname(file_path))
                events[file_path] = {'context': {'entry': entry}}

        if path not in tb_logs_cache:
            tb_logs_cache[path] = {}

        run_cache = tb_logs_cache[path]
        if run_cache:
            run = Run(
                run_hash=run_cache['run_hash'],
                repo=repo_inst,
                system_tracking_interval=None,
                log_system_params=False,
                capture_terminal_logs=False,
            )
        else:
            run = Run(
                repo=repo_inst,
                system_tracking_interval=None,
                log_system_params=False,
                capture_terminal_logs=False,
            )
            run['tensorboard_logdir'] = path
            run_cache.update(
                {
                    'run_hash': run.hash,
                    'events': {},
                }
            )
        run_tb_events = run_cache['events']

        events_to_process = []
        for event in events:
            last_modified_at = os.path.getmtime(event)
            try:
                assert last_modified_at == run_tb_events[event]['last_modified_at']
            except (KeyError, AssertionError, RuntimeError):
                # Something has changed or hasn't been processed before
                events_to_process.append(event)
                try:
                    run_tb_events[event]['last_modified_at'] = last_modified_at
                except KeyError:
                    # Completely new event
                    run_tb_events[event] = {
                        'last_modified_at': last_modified_at,
                        'values': {},
                    }

        if not events_to_process:
            continue

        for event_file in tqdm(events_to_process, desc=f'Parsing logs in {path}', total=len(events_to_process)):
            run_tb_log = run_tb_events[event_file]
            event_context = events[event_file]['context']
            try:
                for event in summary_iterator(event_file):
                    timestamp = event.wall_time
                    step = event.step
                    fail_count = 0
                    _err_info = None

                    for value in event.summary.value:
                        tag = value.tag

                        plugin_name = value.metadata.plugin_data.plugin_name
                        value_id = f'{tag}_{plugin_name}'
                        if value_id in run_tb_log['values']:
                            if run_tb_log['values'][value_id]['timestamp'] >= timestamp:
                                # prevent previously tracked data from re-tracking upon file update
                                continue

                        if len(plugin_name) > 0 and plugin_name not in supported_plugins:
                            if not unsupported_plugin_noticed:
                                click.echo(
                                    'Found unsupported plugin type in the log file. '
                                    'Data for these wont be processed. '
                                    'Supported plugin types are: {}'.format(', '.join(supported_plugins)),
                                    err=True,
                                )
                                unsupported_plugin_noticed = True
                            continue
                        track_val = None
                        try:
                            if value.HasField('tensor'):
                                # TODO: [MV] check the case when audios are passed via tensor
                                if plugin_name == 'images':
                                    tensor = value.tensor.string_val[2:]
                                    track_val = [Image(tf.image.decode_image(t).numpy()) for t in tensor]
                                    if len(track_val) == 1:
                                        track_val = track_val[0]
                                elif plugin_name == 'scalars' or plugin_name == '':
                                    track_val = create_ndarray(value.tensor)
                                else:
                                    track_val = value.tensor.float_val[0]
                            elif value.HasField('simple_value'):
                                track_val = value.simple_value
                            elif value.HasField('image'):
                                track_val = Image(tf.image.decode_image(value.image.encoded_image_string).numpy())
                            elif value.HasField('audio'):
                                tf_audio, sample_rate = tf.audio.decode_wav(value.audio.encoded_audio_string)
                                track_val = Audio(tf_audio.numpy(), rate=sample_rate)

                        except RuntimeError as exc:
                            # catch all the nasty failures
                            fail_count += 1
                            if not _err_info:
                                _err_info = str(exc)
                            continue

                        run_tb_log['values'][value_id] = {'step': step, 'timestamp': timestamp}
                        if track_val is not None:
                            run._tracker._track(track_val, timestamp, tag, step, context=event_context)
                    if fail_count:
                        click.echo(f'Failed to process {fail_count} entries. First exception: {_err_info}', err=True)

            except RuntimeError as exc:
                click.echo(f'Failed to read log file {event_file} - {exc}', err=True)

    # refresh cache
    with open(tb_logs_cache_path, 'w') as FS:
        json.dump(tb_logs_cache, FS)

    click.echo('TensorBoard logs conversion complete!')
