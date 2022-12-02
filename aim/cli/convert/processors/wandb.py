from pathlib import Path
import re
from tempfile import TemporaryDirectory

import click
from tqdm import tqdm

from aim import Run
from aim.ext.resource.log import LogLine
from aim.ext.resource.configs import AIM_RESOURCE_METRIC_PREFIX


def parse_wandb_logs(repo_inst, entity, project, run_id):
    try:
        import wandb
    except ImportError:
        click.echo(
            "Could not process wandb logs - failed to import 'wandb' module.", err=True
        )
        return

    client = wandb.Api()

    if run_id is None:
        # process all runs
        runs = client.runs(entity + "/" + project)
    else:
        try:
            # get the run by run_id
            run = client.run(f"{entity}/{project}/{run_id}")
        except Exception:
            click.echo(f"Could not find run '{entity}/{project}/{run_id}'", err=True)
            return
        runs = (run,)

    for run in tqdm(runs, desc="Converting wandb logs"):
        if not run.config.items():
            continue
        aim_run = Run(
            repo=repo_inst,
            system_tracking_interval=None,
            capture_terminal_logs=False,
            experiment=project
        )
        aim_run['wandb_run_id'] = run.id
        aim_run['wandb_run_name'] = run.name
        aim_run.description = run.notes

        with TemporaryDirectory() as tmpdirname:
            # Collect console output logs
            console_log_filename = 'output.log'
            console_log_file = run.file(console_log_filename)
            try:
                # Even though the file does not exist, a file object will be returned in zero-sized.
                if console_log_file.size:
                    console_log_file.download(root=tmpdirname)
                    with open(Path(tmpdirname) / console_log_filename) as f:
                        [aim_run.track(LogLine(line), name='logs', step=i) for i, line in enumerate(f.readlines())]
            except Exception:
                click.echo("Failed to track console output log.", err=True)

            # TODO: Collect media files, possibly?

        # Collect params & tags
        aim_run['params'] = run.config
        for tag in run.tags:
            aim_run.add_tag(tag)

        keys = [key for key in run.history(stream='default').keys()
                if not key.startswith('_')]

        # Collect metrics
        for record in run.scan_history():
            step = record.get('_step')
            epoch = record.get('epoch')
            timestamp = record.get('_timestamp')
            for key in keys:
                value = record.get(key)
                if value is None:
                    continue
                try:
                    tag, name = key.rsplit("/", 1)
                    if "train" in tag:
                        context = {'tag': tag, 'subset': 'train'}
                    elif "val" in tag:
                        context = {'tag': tag, 'subset': 'val'}
                    elif "test" in tag:
                        context = {'tag': tag, 'subset': 'test'}
                    else:
                        context = {'tag': tag}
                except ValueError:
                    name, context = key, {}
                try:
                    if timestamp:
                        aim_run._tracker._track(value, track_time=timestamp, name=name,
                                                step=step, epoch=epoch, context=context)
                    else:
                        aim_run.track(value, name=name, step=step, epoch=epoch, context=context)
                except ValueError:
                    click.echo(f"Type '{type(value).__name__}': artifacts are not supported yet.", err=True)

        # Collect system logs
        # NOTE: In 'system' logs, collecting sampled history cannot be avoided. (default 'samples' == 500)
        # TODO: cpu / gpu utils are tracked normally as system logs. But not others.
        gpu_idx_pattern = re.compile('^[0-9]+\.')
        for record in run.history(stream='system', pandas=False, samples=1e3):
            timestamp = record.get('_timestamp')
            for key in record:
                if key.startswith('_'):  # Including '_runtime', '_timestamp', '_wandb'
                    continue
                value = record.get(key)
                name = re.sub('^system\.', '', key)

                # Move GPU idx to context
                if name.startswith('gpu'):
                    name = re.sub('^gpu\.', '', name)
                    gpu_idx_str_candids = gpu_idx_pattern.findall(name)
                    if gpu_idx_str_candids:
                        gpu_idx_str = gpu_idx_str_candids[0]
                        name = name[len(gpu_idx_str):]
                        gpu_idx = int(gpu_idx_str.rstrip('.'))
                        context = {'gpu': gpu_idx, 'tag': 'system'}
                    else:
                        context = {'gpu': 'no_idx', 'tag': 'system'}
                else:
                    context = {'tag': 'system'}

                try:
                    if timestamp:
                        aim_run._tracker._track(value, track_time=timestamp,
                                                name=f'{AIM_RESOURCE_METRIC_PREFIX}{name}', context=context)
                    else:
                        aim_run.track(value, name=f'{AIM_RESOURCE_METRIC_PREFIX}{name}', context=context)
                except ValueError:
                    click.echo(f"Type '{type(value).__name__}': artifacts are not supported yet.", err=True)
