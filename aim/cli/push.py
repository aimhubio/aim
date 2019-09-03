import click
import os

from aim.init.repo import AimRepo
from aim.push.tcp_client import FileserverClient
from aim.push.configs import *


@click.command()
def push():
    # Get working directory path
    working_dir = os.environ['PWD']

    # Try to find closest .aim repository
    repo = None
    while True:
        if len(working_dir) <= 1:
            break

        repo = AimRepo(working_dir)
        if repo.exists():
            break
        else:
            repo = None
            working_dir = os.path.split(working_dir)[0]

    if repo is None:
        click.echo('Repository does not exist')
        return

    files = repo.ls_files()
    files_len = len(files)

    # open connection
    tcp_client = FileserverClient(TCP_ADDRESS, TCP_PORT)

    # send files count
    tcp_client.write(files_len)

    for f in files:
        # send file path
        send_file_path = '{project_name}/{file_path}'.format(project_name=repo.get_project_name(),
                                                             file_path=f[len(repo.path)+1:])
        tcp_client.write(send_file_path)

        # send file content line by line
        with open(f, 'r') as content_file:
            for l in content_file.readlines():
                tcp_client.write(l)

        # send end tag
        tcp_client.write('---ENDOFDATA---')

    # close connection
    del tcp_client
