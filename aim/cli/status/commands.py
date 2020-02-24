import click


@click.command()
@click.pass_obj
def status(repo):
    if repo is None:
        click.echo('Repository does not exist')
        return

    click.echo('On branch \'{}\''.format(repo.branch))

    if repo.is_index_empty():
        click.echo('Index is empty')
        return

    meta_file = repo.get_index_meta()
    if not meta_file:
        click.echo('Index meta file not found.')
        return

    to_commit = []
    for meta_item in meta_file.values():
        meta_item_name = meta_item.get('name')
        meta_item_type = meta_item.get('type')
        to_commit.append((meta_item_name, meta_item_type))

    if not to_commit or len(to_commit) == 0:
        return

    click.echo('Artifacts to be committed ' +
               '({} objects):'.format(len(to_commit)))

    for (o_name, o_type) in to_commit:
        if o_name:
            click.echo(click.style('\t- {} '.format(o_name), fg='yellow'),
                       nl=False)

            if o_type:
                click.echo(click.style('[{}]'.format(o_type), fg='cyan'),
                           nl=False)

            click.echo(nl=True)
