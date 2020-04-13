from aim import AimRepo


def get_branches(ctx, args, incomplete):
    # We cannot use repo = ctx.obj as our repo as autocompletion script runs separately and have different context
    # See https://github.com/pallets/click/issues/942 for more info
    repo = AimRepo.get_working_repo()
    if repo is None:
        return []

    return [
        b.get('name') for b in repo.config.get('branches')
        if b.get('name').startswith(incomplete)
    ]