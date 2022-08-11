import click
from click import core
import uuid
import json

from aim.ext.notifier import get_config
from aim.ext.notifier.utils import has_watcher_config, set_default_config
from aim.sdk.run_status_watcher import RunStatusWatcher
from aim.sdk.repo import Repo

core._verify_python3_env = lambda: None
DEFAULT_MESSAGE_TEMPLATE = "❗️ Something wrong with Run '{run_hash}'. Please check. ❗️"


def check_configuration(ctx: click.Context, repo: Repo) -> bool:
    if not has_watcher_config(repo.path):
        click.echo(f'Repo \'{repo.path}\' has no configured notifiers.')
        if click.confirm(f'Would you like to configure notifiers?', default=True):
            ctx.invoke(add_config)
        elif click.confirm('Would you like to use default configuration?'):
            set_default_config(repo.path)
        else:
            return False
    return True


@click.group()
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
@click.pass_context
def cli_entry_point(ctx, repo):
    """Service for detecting and reporting training Run failures."""
    repo_path = repo or Repo.default_repo_path()
    repo = Repo.from_path(repo_path)

    ctx.ensure_object(dict)
    ctx.obj['repo'] = repo
    ctx.obj['config'] = get_config(repo.path)


@cli_entry_point.command('up')
@click.pass_context
def up(ctx):
    """Start Run status watcher."""
    repo = ctx.obj['repo']
    if check_configuration(ctx, repo):
        watcher = RunStatusWatcher(repo)
        watcher.start_watcher()


@cli_entry_point.command('dump')
@click.pass_context
def dump_config(ctx):
    """Dump notifier configuration file."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f'Cannot find notifier configuration for Repo \'{repo.path}\'.')
        return

    click.echo(cfg.dump())


@cli_entry_point.command('list')
@click.pass_context
def list_config(ctx):
    """List available notifiers."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f'Cannot find notifier configuration for Repo \'{repo.path}\'.')
        return

    click.echo("{:<40} {:<10} {:<10}".format('NOTIFIER ID', 'TYPE', 'STATUS'))
    for notifier in cfg.notifiers.values():
        click.echo("{:<40} {:<10} {:<10}".format(notifier['id'], notifier['type'], notifier['status']))


@cli_entry_point.group('add', invoke_without_command=True)
@click.pass_context
def add_config(ctx):
    """Add new notifier configuration."""
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


@cli_entry_point.command('remove')
@click.argument('notifier-id', required=True, type=str)
@click.pass_context
def remove_config(ctx, notifier_id):
    """Remove notifier configuration."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f'Cannot find notifier configuration for Repo \'{repo.path}\'.')
        return

    if notifier_id in cfg.notifiers:
        click.echo(json.dumps(cfg.get(notifier_id), indent=2))
        click.confirm('Remove notifier configuration above?', abort=True)
        cfg.remove(notifier_id)
        cfg.save()
    else:
        click.echo(f'No notifier with id {notifier_id} found.')


@cli_entry_point.command('enable')
@click.argument('notifier-id', required=True, type=str)
@click.pass_context
def enable_config(ctx, notifier_id):
    """Enable notifier configuration."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f'Cannot find notifier configuration for Repo \'{repo.path}\'.')
        return

    if notifier_id in cfg.notifiers:
        cfg.enable(notifier_id)
        cfg.save()
    else:
        click.echo(f'No notifier with id {notifier_id} found.')


@cli_entry_point.command('disable')
@click.argument('notifier-id', required=True, type=str)
@click.pass_context
def disable_config(ctx, notifier_id):
    """Disable notifier configuration."""
    cfg = ctx.obj['config']
    if not cfg.exists():
        repo = ctx.obj['repo']
        click.echo(f'Cannot find notifier configuration for Repo \'{repo.path}\'.')
        return

    if notifier_id in cfg.notifiers:
        cfg.disable(notifier_id)
        cfg.save()
    else:
        click.echo(f'No notifier with id {notifier_id} found.')


@add_config.command('workplace')
@click.option('--group-id', prompt=True, required=True, type=int)
@click.option('--access-token', prompt=True, required=True, type=str)
@click.option('--message', prompt=True, required=False, type=str, default=DEFAULT_MESSAGE_TEMPLATE, show_default=True)
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
        }
    }
    click.echo(json.dumps(new_cfg, indent=2))
    click.confirm('Save notifier configuration above?', default=True, abort=True)
    cfg.add(new_cfg)
    cfg.save()


@add_config.command('slack')
@click.option('--webhook-url', prompt=True, required=True, type=str)
@click.option('--message', prompt=True, required=False, type=str, default=DEFAULT_MESSAGE_TEMPLATE, show_default=True)
@click.pass_context
def slack_config(ctx, webhook_url, message):
    cfg = ctx.obj['config']
    new_cfg = {
        'id': str(uuid.uuid4()),
        'type': 'slack',
        'arguments': {
            'url': webhook_url,
            'message': message,
        }
    }
    click.echo(json.dumps(new_cfg, indent=2))
    click.confirm('Save notifier configuration above?', default=True, abort=True)
    cfg.add(new_cfg)
    cfg.save()


@add_config.command('logger')
@click.option('--message', prompt=True, required=False, type=str, default=DEFAULT_MESSAGE_TEMPLATE, show_default=True)
@click.pass_context
def logger_config(ctx, message):
    cfg = ctx.obj['config']
    new_cfg = {
        'id': str(uuid.uuid4()),
        'type': 'logger',
        'arguments': {
            'message': message,
        }
    }
    click.echo(json.dumps(new_cfg, indent=2))
    click.confirm('Save notifier configuration above?', default=True, abort=True)
    cfg.add(new_cfg)
    cfg.save()
