import click
import os
from aim.deploy.docker.build import DockerDeploy


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
    click.echo('.................................')
    # TODO: add checks and implement properly
    aim_dir = os.environ['AIM_DIR']
    build_dir = os.path.abspath(
        '{}/{}/{}'.format(aim_dir, 'deploy_temp', name))
    deployer = DockerDeploy(model, build_dir)
    deployer.set_img_name(name)
    deployer.set_img_version(version)
    deployer.build_image()
    click.echo('.................................')
    click.echo('GEnerated!!!')
