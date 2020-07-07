import click


def repo_init_alert():
    click.echo('Repository not found')
    click.echo('    (use "aim init" to initialize empty repository)')


def docker_requirement_alert():
    click.echo('Oops! You don\'t have docker installed. ' +
               'AimDE needs docker to run. Please install docker.')
