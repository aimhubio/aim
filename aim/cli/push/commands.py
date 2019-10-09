import click
from urllib.parse import urlparse
import math
import struct

from aim.engine.aim_protocol import FileserverClient


@click.command()
@click.option('-r', '--remote', default='origin', type=str)
@click.pass_obj
def push(repo, remote):
    if repo is None:
        click.echo('Repository does not exist')
        return

    # Prepare to send the repo
    # List and count files
    files = repo.ls_files()
    files_len = len(files)
    click.echo(click.style('{} file(s) to send:'.format(files_len),
                           fg='yellow'))

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
    chunk_size = 4 * 1024 * 1024
    for f in files:
        # Prepare to send the file
        file_path = f[len(repo.path) + 1:]
        send_file_path = '{project}/{file_path}'.format(
            project=remote_project,
            file_path=file_path)

        # Open file
        send_file = open(f, 'rb')
        file_content = send_file.read()
        content_len = len(file_content)
        send_file_formatted_size = math.ceil(content_len / 1024)

        # Send file name
        tcp_client.write_line(send_file_path.encode())
        click.echo('{name} ({size:,}KB)'.format(name=file_path,
                                                size=send_file_formatted_size))

        # Prepare to send the file
        # Get file size and chunks count
        content_pointer = 0
        left_content_len = content_len
        chunk_len = math.ceil(content_len / chunk_size)
        chunks_left = chunk_len

        with click.progressbar(range(chunk_len)) as bar:
            for i in bar:
                if left_content_len > chunk_size:
                    curr_chunk_size = chunk_size
                else:
                    curr_chunk_size = left_content_len

                # Convert the number of remaining chunks and
                # current chunk size to 4-len bytes
                curr_chunk_size_b = struct.pack('>i', curr_chunk_size)
                chunks_left_b = struct.pack('>i', chunks_left)

                # Get appropriate chunk body from content slice
                chunk_body_b = file_content[content_pointer:
                                            content_pointer + curr_chunk_size]

                # Implode chunk header and body
                # Header contains (the number of remaining chunks)[4B]
                # and (current chunk size)[4B]
                #
                # +-------------------------------------------+
                # |    HEADER    |           |      BODY      |
                # +----+    +----+           +---------------+
                # | 4B |----| 4B |-----------| {chunk_size} B |
                # +----+    +----+           +----------------+
                #
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
        print('\x1b[1A' + '\x1b[2K' + '\x1b[1A')

    click.echo(click.style('Done', fg='yellow'))

    # Close connection
    tcp_client.close()
