from typing import Optional


class BaseNotifier(object):
    def __init__(self, _id: str):
        self._id = _id

    def __repr__(self):
        return f'<{self.__class__.__name__} object at {id(self)}>'

    def notify(self, message: Optional[str] = None, **kwargs):
        raise NotImplementedError
