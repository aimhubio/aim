import click


@click.command()
@click.option('--repo', required=False, type=click.Path(exists=True,
                                                        file_okay=False,
                                                        dir_okay=True,
                                                        writable=True))
@click.option('--finalize-only', required=False, is_flag=True, default=False)
def reindex(repo, finalize_only):
    """
    Process runs left in 'in progress' state.
    """
    from aim.utils.deprecation import deprecation_warning

    deprecation_warning(remove_version='3.16', msg='`aim reindex` is deprecated! '
                                                   'Use `aim runs close` command instead.')
    return
