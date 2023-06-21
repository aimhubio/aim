class MissingContainerError(RuntimeError):
    def __init__(self, hash_, mode):
        msg = f'Filed to open Container {hash_} in mode={mode}. Container is missing.'
        super().__init__(msg)


class AmbiguousQueryTypeError(RuntimeError):
    def __init__(self, type_: str):
        msg = f'Queried type \'{type_}\' can be either Container or Sequence type.'
        super().__init__(msg)


class UnknownQueryTypeError(RuntimeError):
    def __init__(self, type_: str):
        msg = f'Queried type \'{type_}\' is not known.'
        super().__init__(msg)
