import click

from aim.engine.profile import AimProfile


@click.command()
@click.option('--username', required=False, type=str)
def config(username):
    profile = AimProfile()

    if username is not None:
        curr_username = profile.get_username()
        if curr_username:
            reset_username = click.confirm(('Current username is `{}`.' +
                                            'Do you want to reset it?' +
                                            '').format(curr_username))
            if not reset_username:
                return

        try:
            profile.set_username(username)
        except TypeError:
            click.echo('Username should be a type of string')
        except AttributeError:
            click.echo('Username must be at least 2 characters ' +
                       'and contain only latin letters, numbers, ' +
                       'dash and underscore')
        else:
            click.echo('Username is successfully set to `{}`'.format(username))
