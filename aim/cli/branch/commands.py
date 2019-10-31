import click


@click.group()
@click.pass_obj
def branch_entry_point(repo):
    if repo is None:
        click.echo('Repository does not exist')
        return

    click.echo(
        click.style('Repository found at {} '.format(repo), fg='yellow'))


@branch_entry_point.command()
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

    click.echo('New branch is added')


@branch_entry_point.command()
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


@branch_entry_point.command()
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

    click.echo('Checkout to {} branch'.format(name))


@branch_entry_point.command()
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

    click.echo('Remote {} is removed'.format(name))
