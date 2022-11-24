from pathlib import Path
from tempfile import TemporaryDirectory

import click
from aim import Run
from aim.ext.resource.log import LogLine


def parse_wandb_logs(repo_inst, entity, project, run_id):
    try:
        import wandb
    except ImportError:
        click.echo(
            'Could not process wandb logs - failed to import "wandb" module.', err=True
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
            click.echo(f'Could not find run "{entity}/{project}/{run_id}"', err=True)
            return
        runs = (run,)

    for run in runs:
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
                click.echo("Failed to track console output log.")

            # TODO: Collect media files, possibly?

        # Collect params & tags
        aim_run['params'] = run.config
        for tag in run.tags:
            aim_run.add_tag(tag)

        keys = [key for key in run.history(stream='default').keys()
                if not key.startswith('_')]
        # TODO: Collect system logs by run.history(stream='system')

        # Collect metrics
        for record in run.scan_history():
            step = record["_step"]
            for key in keys:
                value = record.get(key)
                if value is None:
                    continue
                try:
                    tag, name = key.rsplit("/", 1)
                    if "train" in tag:
                        context = {"tag": tag, "subset": "train"}
                    elif "val" in tag:
                        context = {"tag": tag, "subset": "val"}
                    elif "test" in tag:
                        context = {"tag": tag, "subset": "test"}
                    else:
                        context = {"tag": tag}
                except ValueError:
                    name, context = key, {}
                try:
                    aim_run.track(value, name=name, step=step, context=context)
                except ValueError:
                    click.echo(f"Type '{type(value).__name__}':artifacts are not supported yet.", err=True)
