import click
from urllib.parse import urlparse
import math
import struct

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
    chunk_size = 1024 * 1024
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

            # Prepare to send the file
            content_pointer = 0
            content_len = left_content_len = len(file_content)
            chunk_len = math.ceil(content_len / chunk_size)
            chunks_left = chunk_len

            for i in range(chunk_len):
                if left_content_len > chunk_size:
                    curr_chunk_size = chunk_size
                else:
                    curr_chunk_size = left_content_len

                # Convert chunk size and count to 4-len bytes
                curr_chunk_size_b = struct.pack('>i', curr_chunk_size)
                chunks_left_b = struct.pack('>i', chunks_left)

                # Construct chunk body
                chunk_body_b = file_content[content_pointer:
                                            content_pointer + curr_chunk_size]

                # Implode chunk header and body
                chunk = (curr_chunk_size_b +
                         chunks_left_b +
                         chunk_body_b)

                # Send message
                tcp_client.write(chunk)

                # Dec chunk flags
                left_content_len -= curr_chunk_size
                content_pointer += curr_chunk_size
                chunks_left -= 1

            # Close file
            send_file.close()

    # Close connection
    tcp_client.close()
