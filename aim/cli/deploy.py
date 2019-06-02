import click


@click.command()
@click.option('-m', '--model', type=click.Path(exists=True),
              required=True, help='Path to the model file')
@click.option('-n', '--name', type=click.STRING,
              required=True,
              help='Name of the Inference Docker Conatainer')
def deploy(model, name):
    click.echo('Starting Deployment...')
    click.echo(name)
    click.echo(click.format_filename(model))
