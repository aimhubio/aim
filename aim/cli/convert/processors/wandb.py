import click
from aim import Run, Image, Text, Audio


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
        except:
            click.echo(f'Could not find run with id "{run_id}"', err=True)
            return
        runs = (run,)

    for run in runs:
        if run.config.items():
            aim_run = Run(
                repo=repo_inst,
                system_tracking_interval=None,
                experiment=project
            )
            aim_run.name = run.id
            aim_run.description = run.notes

            # Collect params & tags
            aim_run['params'] = run.config
            aim_run['tags'] = run.tags

            records = run.history()
            keys = [key for key in run.history().keys()
                    if not key.startswith('_')]

            # Collect metrics
            for step in list(records["_step"]):
                record = records.loc[records["_step"] == step]
                for key in keys:
                    value = record[key].values[0]
                    if value != "NaN":
                        try:
                            tag, name = key.rsplit("/", 1)
                            if "train" in tag:
                                context = {"tag": tag, "subset": "train"}
                            elif "val" in tag:
                                context = {"tag": tag, "subset": "val"}
                            else:
                                context = {"tag": tag}
                        except:
                            name, context = key, {}
                        try:
                            aim_run.track(value, name=name, step=step, context=context)
                        except:
                            click.echo(f"Type '{type(value).__name__}':artifacts are not supported yet.", err=True)
