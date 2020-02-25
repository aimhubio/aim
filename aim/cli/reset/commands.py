import click


@click.command()
@click.pass_obj
def reset(repo):
    if repo is None:
        click.echo('Repository does not exist')
        return

    if repo.is_index_empty():
        click.echo('Nothing to reset')
        return

    reset_check = click.confirm('Are you sure you want to reset your ' +
                                'experiment? You will lose all your ' +
                                'uncommitted data')

    if reset_check:
        repo.reset_index()
        click.echo('Successful reset')
