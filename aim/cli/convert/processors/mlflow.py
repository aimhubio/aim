import os.path

from tempfile import TemporaryDirectory

import click

from aim import Audio, Image, Run, Text


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
    except ImportError:
        click.echo('Could not process mlflow logs - failed to import "mlflow" module.', err=True)
        return

    client = mlflow.tracking.client.MlflowClient(tracking_uri=tracking_uri)

    if experiment is None:
        # process all experiments
        experiments = client.list_experiments()
    else:
        try:
            ex = client.get_experiment(experiment)
        except mlflow.exceptions.MlflowException:
            ex = client.get_experiment_by_name(experiment)
        if not ex:
            click.echo(f'Could not find experiment with id or name "{experiment}"', err=True)
            return
        experiments = (ex,)

    for ex in experiments:
        runs = client.search_runs(ex.experiment_id)
        for run in runs:
            run_id = run.info.run_id
            aim_run = Run(
                repo=repo_inst,
                system_tracking_interval=None,
                capture_terminal_logs=False,
                experiment=ex.experiment_id,
            )
            aim_run['mlflow_run_id'] = run.info.run_id
            aim_run['mlflow_run_name'] = run.data.tags.get('mlflow.runName')
            aim_run.description = run.data.tags.get('mlflow.note.content')

            # Collect params & tags
            aim_run['params'] = run.data.params
            aim_run['tags'] = {k: v for k, v in run.data.tags.items() if not k.startswith('mlflow')}

            # Collect metrics
            for key in run.data.metrics.keys():
                for m in client.get_metric_history(run_id, key):
                    aim_run.track(m.value, step=m.step, name=m.key)

            # Collect artifacts
            __html_warning_issued = False
            with TemporaryDirectory(prefix=f'mlflow_{run.info.run_id}_') as temp_path:
                # click.secho(f'Downloading artifacts to {temp_path}', fg='green')
                artifact_loc_stack = [None]
                while artifact_loc_stack:
                    loc = artifact_loc_stack.pop()
                    artifacts = client.list_artifacts(run_id, path=loc)

                    img_batch = []
                    text_batch = []
                    audio_batch = []

                    for file_info in artifacts:
                        if file_info.is_dir:
                            artifact_loc_stack.append(file_info.path)
                            continue

                        downloaded_path = client.download_artifacts(run_id, file_info.path, dst_path=temp_path)
                        if file_info.path.endswith(HTML_EXTENSIONS):
                            # TODO [AP] plotly does not provide interface to load from html
                            # TODO [AP] need to implement html custom object?
                            if not __html_warning_issued:
                                click.secho('Handler for html file types is not yet implemented.', fg='yellow')
                                __html_warning_issued = True
                            continue
                        elif file_info.path.endswith(IMAGE_EXTENSIONS):
                            aim_object = Image
                            kwargs = dict(image=downloaded_path, caption=file_info.path)
                            container = img_batch
                        elif file_info.path.endswith(TEXT_EXTENSIONS):
                            with open(downloaded_path) as fh:
                                content = fh.read()
                            aim_object = Text
                            kwargs = dict(text=content)
                            container = text_batch
                        elif file_info.path.endswith(AUDIO_EXTENSIONS):
                            audio_format = os.path.splitext(file_info.path)[1].lstrip('.')
                            aim_object = Audio
                            kwargs = dict(data=downloaded_path, caption=file_info.path, format=audio_format)
                            container = audio_batch
                        else:
                            click.secho(f'Unresolved or unsupported type for artifact {file_info.path}', fg='yellow')
                            continue

                        try:
                            item = aim_object(**kwargs)
                        except Exception as exc:
                            click.echo(f'Could not convert artifact {file_info.path} into aim object - {exc}', err=True)
                            continue
                        container.append(item)

                    for content_type, seq in (('image', img_batch), ('text', text_batch), ('audio', audio_batch)):
                        aim_run.track(seq, step=0, name=loc or 'root', context={'type': content_type})
