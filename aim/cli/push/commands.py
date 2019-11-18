import os
import click
from urllib.parse import urlparse

from aim.engine.aim_protocol import FileServerClient, File
from aim.engine.aim_profile import AimProfile
from aim.cli.push.utils import send_flags_file


@click.command()
@click.option('-r', '--remote', default='origin', type=str)
@click.option('-b', '--branch', default='', type=str)
@click.pass_obj
def push(repo, remote, branch):
    if repo is None:
        click.echo('Repository does not exist')
        return

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
        commits += list(map(lambda c: (b, c), branch_commits))
        remote_commits += list(map(lambda c: "{}/{}/{}".format(remote_project,
                                                               b, c),
                                   branch_commits))

    if not len(remote_commits):
        click.echo('Nothing to send')
        return

    # Get authentication remote and key
    profile = AimProfile()
    auth = profile.config['auth']
    private_key = ''
    for auth_remote, info in auth.items():
        if remote_url.find(auth_remote) != -1:
            private_key = info['key']
            break

    # Open connection
    try:
        client = FileServerClient(parsed_remote.hostname,
                                  parsed_remote.port,
                                  private_key, click.echo)
    except Exception as e:
        click.echo('Can not open connection to remote. ')
        click.echo('Connection error: {}'.format(e))
        return

    # Send commits comma separated list to get know
    # which commits are not pushed to the remote yet
    commits_cs = ','.join(remote_commits)
    push_commits_bin = client.send_line(commits_cs.encode())

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

        # Push `.flags` file indicating that commit push was successfully done
        send_flags_file(client, '{project}/{branch}/{commit}/{path}'.format(
            project=remote_project,
            branch=commit[0],
            commit=commit[1],
            path='.flags'))

    click.echo(click.style('Done', fg='yellow'))

    # Close connection
    client.close()
