import click

from aim.deploy.docker_image import DockerDeploy


@click.command()
@click.option('-m', '--model', type=click.Path(exists=True),
              required=True, help='Path to the model file')
@click.option('-n', '--name', type=click.STRING,
              required=True,
              help='Name of the Inference Docker Conatainer')
@click.option('-v', '--version', type=click.STRING,
              required=True,
              help='The model version')
def deploy(model, name, version):
    click.echo('Starting Deployment...')
    click.echo(name)
    click.echo(click.format_filename(model))
    deployer = DockerDeploy(model)
    deployer.create_image()
    click.echo('GEnerated!!!')
