import os
import click
from urllib.parse import urlparse
import struct

from aim.engine.aim_protocol import FileServerClient, File
from aim.engine.aim_profile import AimProfile


@click.command()
@click.option('-r', '--remote', default='origin', type=str)
@click.pass_obj
def push(repo, remote):
    if repo is None:
        click.echo('Repository does not exist')
        return

    # Prepare to send the repo
    # List and count files
    branches = repo.list_branches()
    files = []
    for b in branches:
        files += repo.ls_branch_files(b)
    files_len = len(files)

    if files_len > 0:
        click.echo(click.style('{} file(s) to be sent'.format(files_len),
                               fg='yellow'))
    else:
        click.echo('Repo is empty')
        return

    # +1 for `.flags` file
    files_len += 1

    remote_url = repo.get_remote_url(remote)

    # Get authentication remote and key
    profile = AimProfile()
    auth = profile.config['auth']
    private_key = ''
    for auth_remote, info in auth.items():
        if remote_url.find(auth_remote) != -1:
            private_key = info['key']
            break

    # Open connection
    parsed_remote = urlparse(remote_url)
    remote_project = parsed_remote.path.strip(os.sep)
    try:
        client = FileServerClient(parsed_remote.hostname,
                                  parsed_remote.port,
                                  private_key, click.echo)
    except Exception as e:
        click.echo('Can not open connection to remote. ')
        click.echo('Connection error: {}'.format(e))
        return

    # Send project name to get status from server
    response = client.send_line(remote_project.encode())
    if response.startswith('already-pushed'):
        click.echo('Your run has already been pushed to '
                   'remote {}'.format(remote))
        return

    # Send the number of files)
    client.send_line(str(files_len).encode())

    for f in files:
        # Send a file
        file = File(f)
        file_path = f[len(repo.path) + 1:]
        send_file_path = '{project}/{file_path}'.format(
            project=remote_project,
            file_path=file_path)

        # Send file name
        client.send_line(send_file_path.encode())
        click.echo('{name} ({size:,}KB)'.format(name=file_path,
                                                size=file.format_size()))

        # Send file chunks
        with click.progressbar(file) as file_chunks:
            for chunk in file_chunks:
                client.send(chunk)

        # Clear progress bar
        print('\x1b[1A' + '\x1b[2K' + '\x1b[1A')

    # Push `.flags` file indicating that push was successfully done
    send_file_path = '{project}/{file_path}'.format(
        project=remote_project,
        file_path='.flags')
    client.send_line(send_file_path.encode())
    client.send(struct.pack('>i', 1) + struct.pack('>i', 0) + b'\n')

    click.echo(click.style('Done', fg='yellow'))

    # Close connection
    client.close()
