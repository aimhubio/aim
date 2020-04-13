from aim import AimRepo


def get_remotes(ctx, args, incomplete):
    # We cannot use repo = ctx.obj as our repo as autocompletion script runs separately and have different context
    # See https://github.com/pallets/click/issues/942 for more info
    repo = AimRepo.get_working_repo()
    if repo is None:
        return []

    return [
        r.get('name') for r in repo.config.get('remotes')
        if r.get('name').startswith(incomplete)
    ]