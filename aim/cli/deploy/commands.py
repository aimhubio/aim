import click
import os
import time
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
    time.sleep(0.3)
    click.echo('Building the image {}:{}'.format(name, version))
    time.sleep(0.2)
    click.echo('Retrieving the model {}'.format(click.format_filename(model)))
    click.echo('\n')
    # TODO: add checks and implement properly
    aim_dir = os.environ['AIM_DIR']
    build_dir = os.path.abspath(
        '{}/{}/{}'.format(aim_dir, 'deploy_temp', name))
    deployer = DockerDeploy(model, build_dir)
    deployer.set_img_name(name)
    deployer.set_img_version(version)
    deployer.build_image()
