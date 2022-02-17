import os.path
from tempfile import TemporaryDirectory

import click

from aim import Run, Image, Text, Audio

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

# Audio is not handled in mlflow but including here just in case
AUDIO_EXTENSIONS = (
    'flac',
    'mp3',
    'wav',
)


def parse_mlflow_logs(repo_inst, tracking_uri, experiment):
    try:
        import mlflow
    except ModuleNotFoundError:
        click.echo(
            'Could not process mlflow logs - failed to import "mlflow" module.', err=True
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

            # Collect params & tags
            aim_run['params'] = run.data.params
            aim_run['tags'] = {
                k: v for k, v in run.data.tags.items() if not k.startswith('mlflow')
            }
            aim_run['description'] = run.data.tags.get("mlflow.note.content")

            # Collect metrics
            for key in run.data.metrics.keys():
                for m in client.get_metric_history(run_id, key):
                    aim_run.track(m.value, step=m.step, name=m.key)

            # Collect artifacts
            __html_warning_issued = False
            with TemporaryDirectory(prefix=f'mlflow_{run.info.run_uuid}_') as temp_path:
                # click.secho(f'Downloading artifacts to {temp_path}', fg='green')
                artifact_loc_stack = [None]
                while artifact_loc_stack:
                    loc = artifact_loc_stack.pop()
                    artifacts = client.list_artifacts(run_id, path=loc)

                    img_sequence = []
                    text_sequence = []
                    audio_sequence = []

                    for file_info in artifacts:
                        if file_info.is_dir:
                            artifact_loc_stack.append(file_info.path)
                            continue

                        downloaded_path = client.download_artifacts(run_id, file_info.path, dst_path=temp_path)
                        if file_info.path.endswith(HTML_EXTENSIONS):
                            # FIXME plotly does not provide interface to load from html - need to implement html custom object ?
                            if not __html_warning_issued:
                                click.secho(
                                    f'Handler for html file types is not yet implemented.', fg='yellow'
                                )
                                __html_warning_issued = True
                            continue
                        elif file_info.path.endswith(IMAGE_EXTENSIONS):
                            aim_item = Image(downloaded_path, caption=file_info.path)
                            img_sequence.append(aim_item)
                        elif file_info.path.endswith(TEXT_EXTENSIONS):
                            with open(downloaded_path) as fh:
                                content = fh.read()
                            aim_item = Text(content)
                            text_sequence.append(aim_item)
                        elif file_info.path.endswith(AUDIO_EXTENSIONS):
                            audio_format = os.path.splitext(file_info.path)[1].lstrip('.')
                            aim_item = Audio(downloaded_path, caption=file_info.path, format=audio_format)
                            audio_sequence.append(aim_item)
                        else:
                            click.secho(
                                f'Unresolved or unsupported type for artifact {file_info.path}', fg='yellow'
                            )
                            continue

                    for content_type, seq in (('image', img_sequence),
                                              ('text', text_sequence),
                                              ('audio', audio_sequence)):
                        aim_run.track(seq, step=0, name=loc or 'root', context={'type': content_type})
