from typing import Optional


class BaseNotifier(object):
    def __init__(self, _id: str):
        self._id = _id

    def notify(self, message: Optional[str] = None, **kwargs):
        raise NotImplementedError
