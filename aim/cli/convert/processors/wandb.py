import click
from aim import Run


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
        if run.config.items():
            aim_run = Run(
                repo=repo_inst,
                system_tracking_interval=None,
                capture_terminal_logs=False,
                experiment=project
            )
            aim_run['wandb_run_id'] = run.id
            aim_run['wandb_run_name'] = run.name
            aim_run.description = run.notes

            # Collect params & tags
            aim_run['params'] = run.config
            for tag in run.tags:
                aim_run.add_tag(tag)

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
                        except ValueError:
                            name, context = key, {}
                        try:
                            aim_run.track(value, name=name, step=step, context=context)
                        except ValueError:
                            click.echo(f"Type '{type(value).__name__}':artifacts are not supported yet.", err=True)
