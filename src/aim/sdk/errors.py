class RepoIntegrityError(RuntimeError):
    pass


class MissingRunError(RuntimeError):
    pass


class RunLockingError(RuntimeError):
    pass
