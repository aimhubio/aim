import click
import os

from aim.engine.repo.repo import AimRepo
from aim.artifacts.artifact_writer import ArtifactWriter
from aim.artifacts.map import NestedMap
from aim.engine.configs import (
    AIM_MAP_METRICS_KEYWORD,
)


@click.group()
@click.pass_obj
def exp_entry_point(repo):
    if repo is None:
        click.echo('Repository does not exist')
        exit()

    click.echo(
        click.style('Repository found at {} '.format(repo), fg='yellow'))


@exp_entry_point.command()
@click.option('-n', '--name', required=True, type=str)
@click.pass_obj
def add(repo, name):
    if repo is None:
        return

    # Create new branch
    try:
        repo.create_branch(name)
    except AttributeError as e:
        click.echo(e)
        return

    # Checkout to the created branch
    try:
        repo.checkout_branch(name)
    except AttributeError as e:
        click.echo(e)
        return

    click.echo('New experiment is added')


@exp_entry_point.command()
@click.pass_obj
def ls(repo):
    if repo is None:
        return

    branches = repo.config.get('branches')
    for b in branches:
        if repo.config.get('active_branch') == b.get('name'):
            branch_output = '* {}'.format(b.get('name'))
            click.echo(click.style(branch_output, fg='yellow'))
        else:
            branch_output = '  {}'.format(b.get('name'))
            click.echo(branch_output)


@exp_entry_point.command()
@click.option('-n', '--name', required=True, type=str)
@click.pass_obj
def checkout(repo, name):
    if repo is None:
        return

    try:
        repo.checkout_branch(name)
    except AttributeError as e:
        click.echo(e)
        return

    click.echo('Checkout to {} experiment'.format(name))


@exp_entry_point.command()
@click.option('-n', '--name', required=True, type=str)
@click.pass_obj
def rm(repo, name):
    if repo is None:
        return

    # Remove branch
    try:
        repo.remove_branch(name)
    except AttributeError as e:
        click.echo(e)
        return

    click.echo('Experiment {} is removed'.format(name))


@exp_entry_point.command()
@click.option('-n', '--name', required=True, type=str)
@click.option('-r', '--run', type=str, multiple=True)
@click.pass_obj
def close(repo, name, run):
    if repo is None:
        return

    experiment_name = name
    selected_runs = list(run)

    if len(selected_runs) and not experiment_name:
        click.echo('Experiment name is not specified')
        return

    all_experiments = repo.list_branches()

    if experiment_name:
        if experiment_name not in all_experiments:
            click.echo('Experiment "{}" not found'.format(experiment_name))
            return
        selected_experiments = [experiment_name]
    else:
        selected_experiments = all_experiments

    for experiment_name in selected_experiments:
        click.echo('-> {}'.format(experiment_name))

        experiment_all_runs = repo.list_branch_commits(experiment_name)

        if len(selected_runs) == 0:
            experiment_runs = experiment_all_runs
        else:
            experiment_runs = selected_runs

        for run in experiment_runs:
            if run not in experiment_all_runs:
                click.echo('   (run "{}" not found)'.format(run))
                continue

            repo_run = AimRepo(repo_full_path=repo.path,
                               repo_branch=experiment_name,
                               repo_commit=run)
            run_finished = repo_run.is_run_finished()

            if run_finished is None:
                continue
            elif run_finished:
                click.echo('   {} (closed)'.format(run))
                continue
            elif not run_finished:
                click.echo(click.style(' * {} (open)'.format(run), fg='yellow'))

            click.echo(click.style('   closing...'.format(run), fg='yellow'))

            # Remove corrupted meta file
            if os.path.isfile(repo_run.meta_file_path):
                os.remove(repo_run.meta_file_path)

            # Finalize and close dangling artifacts
            if repo_run.records_storage is not None:
                repo_run.records_storage.finalize_dangling_artifacts()
                repo_run.records_storage.close()

            # Reconstruct meta file
            meta_content = repo_run.reconstruct_meta_file()
            repo_run.flush_meta_file(meta_content)

            # Aggregate and update metrics
            run_model = repo_run.select_run_metrics(experiment_name, run)
            if run_model is not None:
                aggregated_values = run_model.get_aggregated_metrics_values()
                artifact = NestedMap(aggregated_values, AIM_MAP_METRICS_KEYWORD)
                writer = ArtifactWriter()
                writer.save(repo_run, artifact)

            # Finalize run
            repo_run.commit_finish()

            click.echo(click.style('   closed'.format(run), fg='green'))
