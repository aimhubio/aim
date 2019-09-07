import click

from aim.push.tcp_client import FileserverClient
from aim.push.configs import *


@click.command()
@click.pass_obj
def push(repo):
    if repo is None:
        click.echo('Repository does not exist')
        return

    click.echo('Counting objects')

    files = repo.ls_files()
    files_len = len(files)

    click.echo('{} file(s) to send:'.format(files_len))

    # open connection
    try:
        tcp_client = FileserverClient(TCP_ADDRESS, TCP_PORT)
    except Exception:
        click.echo('Can not open connection to remote')
        return

    # send files count
    tcp_client.write(files_len)

    with click.progressbar(files) as bar:
        for f in bar:
            # send file path
            send_file_path = '{project_name}/{file_path}'.format(
                project_name=repo.get_project_name(),
                file_path=f[len(repo.path) + 1:])
            tcp_client.write(send_file_path)

            # send file content line by line
            with open(f, 'r') as content_file:
                for l in content_file.readlines():
                    tcp_client.write(l)

            # send end tag
            tcp_client.write('---ENDOFDATA---')

    # close connection
    del tcp_client
