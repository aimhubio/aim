import click

from aim._ext.tracking import analytics


@click.group('telemetry', hidden=True)
def telemetry():
    pass


@telemetry.command('off')
def turn_off_tracking():
    analytics.telemetry_enabled = False


@telemetry.command('on')
def turn_on_tracking():
    analytics.telemetry_enabled = True
