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


def check_configuration(repo: Repo):
    if not has_watcher_config(repo.path):
        if click.confirm(f'Repo {repo.path} has no configured notifications. Would you like to '
                         f'use default configuration?', abort=True):
            set_default_config(repo.path)


@click.group(invoke_without_command=True)
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
@click.pass_context
def cli_entry_point(ctx, repo):
    repo_path = repo or Repo.default_repo_path()
    if ctx.invoked_subcommand is None:
        repo = Repo.from_path(repo_path)
        check_configuration(repo)
        watcher = RunStatusWatcher(repo)
        watcher.start_watcher()
    else:
        ctx.ensure_object(dict)
        ctx.obj['repo_path'] = repo_path


@cli_entry_point.group('config', invoke_without_command=True)
@click.pass_context
def config(ctx):
    repo_path = ctx.obj['repo_path']
    repo = Repo.from_path(repo_path)
    check_configuration(repo)

    ctx.obj['config'] = get_config(repo.path)
    if ctx.invoked_subcommand is None:
        ctx.invoke(add_config)


@config.command('dump')
@click.pass_context
def dump_config(ctx):
    config = ctx.obj['config']
    click.echo(config.dump())


@config.group('add', invoke_without_command=True)
@click.pass_context
def add_config(ctx):
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
            add_new = click.confirm('Would you like to add another Notifier?')


@config.command('remove')
@click.argument('notifier-id', required=True, type=str)
@click.pass_context
def remove_config(ctx, notifier_id):
    cfg = ctx.obj['config']
    if notifier_id in cfg.notifiers:
        click.echo(json.dumps(cfg.get(notifier_id), indent=2))
        click.confirm('Remove configuration above?', abort=True)
        cfg.remove(notifier_id)
        cfg.save()
    else:
        click.echo(f'No notifier with id {notifier_id} found.')


@config.command('enable')
@click.argument('notifier-id', required=True, type=str)
@click.pass_context
def enable_config(ctx, notifier_id):
    cfg = ctx.obj['config']
    if notifier_id in cfg.notifiers:
        cfg.enable(notifier_id)
        cfg.save()
    else:
        click.echo(f'No notifier with id {notifier_id} found.')


@config.command('disable')
@click.argument('notifier-id', required=True, type=str)
@click.pass_context
def disable_config(ctx, notifier_id):
    cfg = ctx.obj['config']
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
    click.confirm('Save configuration above?', abort=True)
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
    click.confirm('Save configuration above?', abort=True)
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
    click.confirm('Save configuration above?', abort=True)
    cfg.add(new_cfg)
    cfg.save()
