import os
from tempfile import TemporaryDirectory

import click

from aim import Run, Image, Text

IMAGE_EXTENSIONS = ('jpg', 'bmp', 'jpeg', 'png', 'gif', 'svg')
HTML_EXTENSIONS = ('html',)
TEXT_EXTENSIONS = (
    'txt',
    'log',
    'py',
    'js',
    'yaml',
    'yml',
    'json',
    'csv',
    'tsv',
    'md',
    'rst',
    'jsonnet',
)


def parse_mlflow_logs(repo_inst, tracking_uri, experiment):
    try:
        import mlflow
    except ModuleNotFoundError:
        click.echo(
            click.style(
                'Could not process mlflow logs - failed to import "mlflow" module.', fg='red'
            )
        )
        return

    client = mlflow.tracking.client.MlflowClient(tracking_uri=tracking_uri)

    if experiment is None:
        # process all experiments
        experiments = client.list_experiments()
    else:
        experiments = (client.get_experiment_by_name(experiment),)

    for ex in experiments:
        runs = client.search_runs(ex.experiment_id)
        for run in runs:
            run_id = run.info.run_id
            aim_run = Run(
                repo=repo_inst,
                system_tracking_interval=None,
                run_hash=run.info.run_uuid,
                experiment=ex.experiment_id,
            )

            # Collect params
            aim_run["params"] = run.data.params

            # Collect metrics
            for key in run.data.metrics.keys():
                for m in client.get_metric_history(run_id, key):
                    aim_run.track(m.value, step=m.step, name=m.key)

            # Collect artifacts
            artifacts = client.list_artifacts(run_id)
            with TemporaryDirectory(prefix=f'mlflow_{run.info.run_uuid}_') as temp_path:
                click.echo(f"Downloading artifacts to {temp_path}")
                for file_info in artifacts:
                    downloaded_path = client.download_artifacts(run_id, file_info.path, dst_path=temp_path)
                    if file_info.is_dir:
                        continue
                    elif file_info.path.endswith(HTML_EXTENSIONS):
                        # FIXME plotly does not provide interface to load from html - need to implement html custom object ?
                        continue
                    elif file_info.path.endswith(IMAGE_EXTENSIONS):
                        aim_item = Image(downloaded_path)
                    elif file_info.path.endswith(TEXT_EXTENSIONS):
                        with open(downloaded_path) as fh:
                            content = fh.read()
                        aim_item = Text(content)
                    else:
                        click.echo(
                            click.style(f'Unresolved or unsupported type for artifact {file_info.path}', fg='yellow')
                        )
                        continue

                    aim_run.track(aim_item, step=0, name=file_info.path)
