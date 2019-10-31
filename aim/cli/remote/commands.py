import click


@click.group()
@click.pass_obj
def remote_entry_point(repo):
    if repo is None:
        click.echo('Repository does not exist')
        return

    click.echo(click.style('Repository found at {} '.format(repo), fg='yellow'))


@remote_entry_point.command()
@click.option('-n', '--name', required=True, type=str)
@click.option('-u', '--url', required=True, type=str)
@click.pass_obj
def add(repo, name, url):
    if repo is None:
        return

    remotes = repo.config['remotes']

    for r in remotes:
        if r.get('name') == name:
            click.echo('Remote {} already exists'.format(name))
            return

    remotes.append({
        'name': name,
        'url': url,
    })

    repo.save_config()

    click.echo('New remote is added')


@remote_entry_point.command()
@click.option('-n', '--name', required=True, type=str)
@click.pass_obj
def rm(repo, name):
    if repo is None:
        return

    remote_exists = False
    for r in repo.config['remotes']:
        if r['name'] == name:
            remote_exists = True
            break

    if not remote_exists:
        click.echo('Remote {} not found'.format(name))
        return

    repo.config['remotes'] = list(filter(lambda i: i['name'] != name,
                                         repo.config['remotes']))
    repo.save_config()

    click.echo('Remote {} is removed'.format(name))


@remote_entry_point.command()
@click.pass_obj
def ls(repo):
    if repo is None:
        return

    remotes = repo.config.get('remotes')

    if not len(remotes):
        click.echo('No remote was found')
        return

    for r in remotes:
        click.echo('{name}: {url}'.format(name=r.get('name'),
                                          url=r.get('url')))
