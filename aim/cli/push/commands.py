import os
import click
from urllib.parse import urlparse
import uuid

from aim.__version__ import __version__ as aim_version
from aim.engine.aim_protocol import FileServerClient, File
from aim.engine.aim_profile import AimProfile
from aim.cli.push.utils import send_flags_file


@click.command()
@click.option('-r', '--remote', default='origin', type=str)
@click.option('-b', '--branch', default='', type=str)
@click.option('-m', '--message', default='', type=str)
@click.pass_obj
def push(repo, remote, branch, message):
    if repo is None:
        click.echo('Repository does not exist')
        return

    if message:
        commit_hash = str(uuid.uuid1())
        message = message.strip()

        # Check if there is anything to commit
        if repo.is_index_empty():
            click.echo('Nothing to commit')
        else:
            # Commit changes
            commit_res = repo.commit(commit_hash, message)

            click.echo(click.style('[{b}/{c} commit]'.format(
                b=commit_res['branch'],
                c=commit_res['commit']), fg='yellow'))
            click.echo(message)

    branch = branch.strip()

    # Get remote host and project name
    remote_url = repo.get_remote_url(remote)
    if remote_url is None:
        click.echo('Remote {} not found'.format(remote))
        return

    parsed_remote = urlparse(remote_url)
    remote_project = parsed_remote.path.strip(os.sep)

    if not remote_project:
        click.echo('Project name is not specified')
        return

    # Prepare to send the repo: list branches with their commits
    # List branches
    if branch:
        branches = [branch]
    else:
        branches = repo.list_branches()

    # List commits
    remote_commits = []
    commits = []
    for b in branches:
        branch_commits = repo.list_branch_commits(b)
        commits += list(map(lambda co: (b, co), branch_commits))
        remote_commits += list(map(lambda co: "{}/{}/{}".format(remote_project,
                                                                b, co),
                                   branch_commits))

    if not len(remote_commits):
        click.echo('Nothing to send')
        return

    remote_url = repo.get_remote_url(remote)
    if not remote_url:
        click.echo('Invalid remote {}'.format(remote))
        return

    parsed_remote = urlparse(remote_url)
    remote_hostname = parsed_remote.hostname or remote_url
    remote_port = parsed_remote.port or 8002

    if not remote_hostname:
        click.echo('Invalid {} hostname'.format(remote))
        return

    # Get authentication remote and key
    profile = AimProfile()
    auth = profile.config['auth']
    private_key = ''
    for auth_remote, info in auth.items():
        if auth_remote.find(remote_hostname) != -1:
            private_key = info['key']
            break

    if not private_key:
        click.echo('Authentication key not found for remote {}'.format(remote))
        return

    # Open connection
    remote_project = parsed_remote.path.strip(os.sep)
    try:
        client = FileServerClient(remote_hostname,
                                  remote_port,
                                  private_key, click.echo)
    except Exception as e:
        click.echo('Can not open connection to remote. ')
        click.echo('Connection error: {}'.format(e))
        return

    # Send version number
    client.send_line(aim_version.encode())

    # Parse and send user name
    user_name, _, query = (parsed_remote.path or '').strip('/').partition('/')
    if not user_name:
        click.echo('User not found')
        return

    client.send_line(user_name.encode())

    # Send commits comma separated list to get know
    # which commits are not pushed to the remote yet
    commits_cs = ','.join(remote_commits)
    push_commits_bin = client.send_line(commits_cs.encode())

    # Exit push if empty string is returned
    # TODO: Return forbidden status code from the server and
    #  implement appropriate check
    if push_commits_bin == '':
        click.echo('Forbidden: you don\'t have permission to access this repo')
        return

    push_commits_res_rep = int(push_commits_bin)
    push_commits_rep_bin = format(push_commits_res_rep, 'b')

    if not push_commits_res_rep:
        click.echo('Nothing to send')
        client.send_line('0'.encode())
        return

    push_commits = []
    offset = len(commits) - len(push_commits_rep_bin)
    for c in range(len(commits)):
        if c >= offset and push_commits_rep_bin[c-offset] == '1':
            push_commits.append(commits[c])

    files = {}
    files_len = 0
    for c in push_commits:
        files[c] = repo.ls_commit_files(c[0], c[1])
        files_len += len(files[c]) + 1

    click.echo(click.style('{} file(s) to be sent'.format(files_len),
                           fg='yellow'))

    # Send the number of files)
    client.send_line(str(files_len).encode())

    for commit, files in files.items():
        commit_sent = True
        commit_prefix = '{b}/{c}'.format(b=commit[0], c=commit[1])
        click.echo('{}:'.format(commit_prefix))
        for f in files:
            # Send a file
            file = File(f)
            file_path = f[len(repo.path) + 1:]
            send_file_path = '{project}/{file_path}'.format(
                project=remote_project,
                file_path=file_path)

            # Send file name
            client.send_line(send_file_path.encode())
            file_print_name = file_path[len(commit_prefix)+1:]
            click.echo('-> {name} ({size:,}KB)'.format(name=file_print_name,
                                                       size=file.format_size()))

            # Send file chunks
            successfully_sent = True
            if file.content_len:
                with click.progressbar(file) as file_chunks:
                    for chunk in file_chunks:
                        if not client.send(chunk):
                            commit_sent = False
                            successfully_sent = False
                            break
            else:
                client.send(file.empty_chunk())

            # Clear progress bar
            print('\x1b[1A' + '\x1b[2K' + '\x1b[1A')

            if not successfully_sent:
                break

        if commit_sent:
            # Push `.flags` file indicating that
            # commit was successfully pushed to remote
            send_flags_file(client, '{project}/{branch}/{commit}/{path}'.format(
                project=remote_project,
                branch=commit[0],
                commit=commit[1],
                path='.flags'))
        else:
            break

    # Get connection status: 200 - ok, 400 - err
    status = client.receive_str().strip()
    if status == '200':
        # Success
        click.echo(click.style('Done', fg='yellow'))
    else:
        click.echo(click.style('File was not sent. ' +
                               'Probably your storage is full.', fg='red'))

    # Close connection
    client.close()
