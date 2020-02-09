import os
import click

from aim.engine.aim_profile import AimProfile


@click.command()
@click.option('-a', '--address', required=True, type=str)
def auth(address):
    profile = AimProfile()

    keys = profile.auth(address)
    public_key = keys['public_key']

    click.echo(click.style('Your public key for {}'.format(address),
                           fg='yellow'), err=True)
    click.echo(public_key)
    click.echo()
