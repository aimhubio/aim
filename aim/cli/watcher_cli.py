import logging
import uuid

from collections import OrderedDict
from typing import Mapping, Optional

import click

from aim.ext.notifier import get_config
from aim.ext.notifier.utils import has_watcher_config, set_default_config
from aim.sdk.repo import Repo
from aim.sdk.run_status_watcher import RunStatusWatcher
from click import core


core._verify_python3_env = lambda: None
DEFAULT_MESSAGE_TEMPLATE = "❗️ Something wrong with Run '{run.hash}'. Please check. ❗️"
MESSAGE_PROMPT = 'Stuck Runs notification message'


class OrderedGroup(click.Group):
    def __init__(self, name: Optional[str] = None, commands: Optional[Mapping[str, click.Command]] = None, **kwargs):
        super(OrderedGroup, self).__init__(name, commands, **kwargs)
        #: the registered subcommands by their exported names.
        self.commands = commands or OrderedDict()

    def list_commands(self, ctx: click.Context) -> Mapping[str, click.Command]:
        return self.commands


def check_configuration(ctx: click.Context, repo: Repo) -> bool:
    if not has_watcher_config(repo.path):
        click.echo(f"Repo '{repo.path}' has no configured notifiers.")
        if click.confirm('Would you like to configure notifiers?', default=True):
            ctx.invoke(add_config)
        elif click.confirm('Would you like to use default configuration?'):
            set_default_config(repo.path)
        else:
            return False
    return True


def dump_notifier_config(cfg: dict):
    lines = ['', '', f'Type: {cfg["type"]}']
    for arg_name, value in cfg['arguments'].items():
        printable_name = arg_name.replace('_', ' ').capitalize()
        lines.append(f'{printable_name}: {value}')
    lines.append('--------')
    click.echo('\n'.join(lines))


@click.group()
@click.option(
    '--repo',
    required=False,
    help='Aim Repo to check Run statuses.',
    type=click.Path(exists=True, file_okay=False, dir_okay=True, writable=True),
)
@click.pass_context
def cli_entry_point(ctx, repo):
    """Service for detecting and reporting training Run failures."""
    repo_path = repo or Repo.default_repo_path()
    repo = Repo.from_path(repo_path)

    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo
    ctx.obj['config'] = get_config(repo.path)


@cli_entry_point.command(name='start')
@click.pass_context
def start_watcher(ctx):
    """Start watcher service to monitor and report stuck/failed Runs."""
    repo = ctx.obj['repo']
    if check_configuration(ctx, repo):
        watcher = RunStatusWatcher(repo)
        click.secho(f"Starting Aim watcher for repo '{repo.path}'...", fg='yellow')
        click.echo('Press Ctrl+C to exit')

        watcher.start_watcher()


@cli_entry_point.group(cls=OrderedGroup, name='notifiers')
@click.pass_context
def config_notifiers(ctx):
    """Configure how notifications should be received."""
    pass


@click.command(name='dump', hidden=True)
@click.pass_context
def dump_config(ctx):
    """Dump notifier configuration file."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f"Cannot find notifier configuration for Repo '{repo.path}'.")
        return

    click.echo(cfg.dump())


@click.command(name='list')
@click.pass_context
def list_config(ctx):
    """List available notifiers."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f"Cannot find notifier configuration for Repo '{repo.path}'.")
        return

    click.echo('{:<40} {:<10} {:<10}'.format('NOTIFIER ID', 'TYPE', 'STATUS'))
    for notifier in cfg.notifiers.values():
        click.echo('{:<40} {:<10} {:<10}'.format(notifier['id'], notifier['type'], notifier['status']))


@click.command(name='get-log-level')
@click.pass_context
def get_log_level(ctx):
    """Get Log Notifications level."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f"Cannot find notifier configuration for Repo '{repo.path}'.")
        return

    click.echo(f'Log level: {logging.getLevelName(cfg.log_level)}')


def get_level_names():
    available_levels = (logging.CRITICAL, logging.ERROR, logging.WARNING, logging.INFO, logging.DEBUG)
    return tuple(map(logging.getLevelName, available_levels))


@click.command(name='set-log-level')
@click.argument('level', required=True, type=click.Choice(get_level_names()))
@click.pass_context
def set_log_level(ctx, level):
    """Set Log Notifications level to <level>."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f"Cannot find notifier configuration for Repo '{repo.path}'.")
        return

    cfg.log_level = getattr(logging, level)
    cfg.save()


@click.group(name='add', invoke_without_command=True)
@click.pass_context
def add_config(ctx):
    """Add a new notifier configuration (slack, workplace, etc.)."""
    if ctx.invoked_subcommand is None:
        add_new = True
        while add_new:
            sub_commands = ctx.command.list_commands(ctx)
            choice = click.prompt('Select notifier type to add:', show_choices=True, type=click.Choice(sub_commands))
            sub_cmd = ctx.command.get_command(ctx, choice)
            extra_args = {}
            for param in sub_cmd.params:
                if isinstance(param, click.Option) and param.prompt:
                    extra_args[param.name] = param.prompt_for_value(ctx)
            ctx.invoke(sub_cmd, **extra_args)
            add_new = click.confirm('Would you like to add another notifier?')


@click.command(name='remove')
@click.argument('notifier-id', required=True, type=str)
@click.pass_context
def remove_config(ctx, notifier_id):
    """Remove notifier configuration from the list."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f"Cannot find notifier configuration for Repo '{repo.path}'.")
        return

    if notifier_id in cfg.notifiers:
        dump_notifier_config(cfg.get(notifier_id))
        click.confirm('Remove notifier configuration above?', abort=True)
        cfg.remove(notifier_id)
        cfg.save()
    else:
        click.echo(f'No notifier with id {notifier_id} found.')


@click.command(name='enable')
@click.argument('notifier-id', required=True, type=str)
@click.pass_context
def enable_config(ctx, notifier_id):
    """Start receiving notifications from given notifier."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f"Cannot find notifier configuration for Repo '{repo.path}'.")
        return

    if notifier_id in cfg.notifiers:
        cfg.enable(notifier_id)
        cfg.save()
    else:
        click.echo(f'No notifier with id {notifier_id} found.')


@click.command(name='disable')
@click.argument('notifier-id', required=True, type=str)
@click.pass_context
def disable_config(ctx, notifier_id):
    """Stop receiving notifications from given notifier."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f"Cannot find notifier configuration for Repo '{repo.path}'.")
        return

    if notifier_id in cfg.notifiers:
        cfg.disable(notifier_id)
        cfg.save()
    else:
        click.echo(f'No notifier with id {notifier_id} found.')


@add_config.command(name='workplace')
@click.option('--group-id', prompt=True, required=True, type=int)
@click.option('--access-token', prompt=True, required=True, type=str)
@click.option(
    '--message', prompt=MESSAGE_PROMPT, required=False, type=str, default=DEFAULT_MESSAGE_TEMPLATE, show_default=True
)
@click.pass_context
def workplace_config(ctx, group_id, access_token, message):
    cfg = ctx.obj['config']
    new_cfg = {
        'id': str(uuid.uuid4()),
        'type': 'workplace',
        'arguments': {
            'group_id': group_id,
            'access_token': access_token,
            'message': message,
        },
    }
    dump_notifier_config(new_cfg)
    click.confirm('Save notifier configuration above?', default=True, abort=True)
    cfg.add(new_cfg)
    cfg.save()


@add_config.command(name='slack')
@click.option('--webhook-url', prompt=True, required=True, type=str)
@click.option(
    '--message', prompt=MESSAGE_PROMPT, required=False, type=str, default=DEFAULT_MESSAGE_TEMPLATE, show_default=True
)
@click.pass_context
def slack_config(ctx, webhook_url, message):
    cfg = ctx.obj['config']
    new_cfg = {
        'id': str(uuid.uuid4()),
        'type': 'slack',
        'arguments': {
            'url': webhook_url,
            'message': message,
        },
    }
    dump_notifier_config(new_cfg)
    click.confirm('Save notifier configuration above?', default=True, abort=True)
    cfg.add(new_cfg)
    cfg.save()


@add_config.command(name='logger')
@click.option(
    '--message', prompt=MESSAGE_PROMPT, required=False, type=str, default=DEFAULT_MESSAGE_TEMPLATE, show_default=True
)
@click.pass_context
def logger_config(ctx, message):
    cfg = ctx.obj['config']
    new_cfg = {
        'id': str(uuid.uuid4()),
        'type': 'logger',
        'arguments': {
            'message': message,
        },
    }
    dump_notifier_config(new_cfg)
    click.confirm('Save notifier configuration above?', default=True, abort=True)
    cfg.add(new_cfg)
    cfg.save()


config_notifiers.add_command(add_config)
config_notifiers.add_command(list_config)
config_notifiers.add_command(remove_config)
config_notifiers.add_command(disable_config)
config_notifiers.add_command(enable_config)
config_notifiers.add_command(dump_config)
config_notifiers.add_command(get_log_level)
config_notifiers.add_command(set_log_level)
