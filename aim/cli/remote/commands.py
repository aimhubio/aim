import click


@click.group()
def entry_point():
    pass


@entry_point.command()
def rm():
    click.echo('remote rm')


@entry_point.command()
def ls():
    click.echo('remote ls')
