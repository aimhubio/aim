import click
from urllib.parse import urlparse
import math

from aim.push.tcp_client import FileserverClient


@click.command()
@click.option('-r', '--remote', default='origin', type=str)
@click.pass_obj
def push(repo, remote):
    if repo is None:
        click.echo('Repository does not exist')
        return

    # Prepare to send the repo
    # List and count files
    click.echo('Counting objects')
    files = repo.ls_files()
    files_len = len(files)
    click.echo('{} file(s) to send:'.format(files_len))

    # Set up tcp connection
    parsed_remote = urlparse(repo.get_remote_url(remote))
    remote_project = parsed_remote.path.strip('/')

    try:
        tcp_client = FileserverClient(parsed_remote.hostname,
                                      parsed_remote.port)
    except Exception:
        click.echo('Can not open connection to remote. ' +
                   'Check if remote {} exists'.format(remote))
        return

    # Send project name to get status from server
    response = tcp_client.write_line(remote_project.encode())
    if response.startswith('already-pushed'):
        click.echo('Your run has already been pushed to '
                   'remote {}'.format(remote))
        return

    # Send the number of files)
    tcp_client.write_line(str(files_len).encode())

    # Send files
    chunk_size = 2048
    with click.progressbar(files) as bar:
        for f in bar:
            # Send file path
            send_file_path = '{project}/{file_path}'.format(
                project=remote_project,
                file_path=f[len(repo.path) + 1:])
            tcp_client.write_line(send_file_path.encode())

            # Open file
            send_file = open(f, 'rb')
            file_content = send_file.read()

            # Send file chunks count
            chunk_len = math.ceil(len(file_content) / chunk_size)
            tcp_client.write_line(str(chunk_len).encode())

            # Send file chunks
            chunk_index = 0
            for i in range(chunk_len):
                if i < chunk_len - 1:
                    chunk = file_content[chunk_index:
                                         chunk_index + chunk_size]
                else:
                    chunk = file_content[chunk_index:]

                tcp_client.write(chunk)
                chunk_index += chunk_size

            # Close file
            send_file.close()

    # Close connection
    tcp_client.close()
