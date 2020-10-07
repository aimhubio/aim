import click

from aim.engine.container import AimContainer


def repo_init_alert():
    click.echo('Repository not found')
    click.echo('    (use "aim init" to initialize empty repository)')


def docker_requirement_alert():
    click.echo('Oops! You don\'t have docker installed. ' +
               'Aim UI runs on docker. Please install docker.')


def docker_image_pull_fail_alert():
    click.echo()
    click.echo('Failed to pull Aim UI docker image.')
    click.echo(
        click.style('    (NOTE: If somehow docker is stuck downloading, ' +
                    'please restart docker and try again)', fg='yellow'))


def check_docker_dependency(exit_process=True):
    if not AimContainer.is_docker_installed():
        docker_requirement_alert()
        if exit_process:
            exit()
