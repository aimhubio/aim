from typing import Dict, List, Tuple, Union

from aim._core.storage.utils import BLOB  # noqa F401

NoneType = type(None)


AimObjectKey = Union[int, str]
AimObjectPath = Tuple[AimObjectKey, ...]
AimObjectPrimitive = Union[
    NoneType,
    bool,
    int,
    float,
    str,
    bytes
]
AimObjectArray = Union[List['AimObject'], Tuple['AimObject', ...]]
AimObjectDict = Dict[AimObjectKey, 'AimObject']
AimObject = Union[
    AimObjectPrimitive,
    AimObjectArray,
    AimObjectDict
]


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args,
                                                                 **kwargs)
        return cls._instances[cls]


class SafeNone(metaclass=Singleton):
    def get(self, item):
        return self

    def __repr__(self):
        return 'None'

    def __call__(self, *args, **kwargs):
        return self

    def __getattr__(self, item):
        return self

    def __getitem__(self, item):
        return self

    def __bool__(self):
        return False

    def __eq__(self, other):
        return other is None or isinstance(other, SafeNone)

    def __iter__(self):
        return self

    def __next__(self):
        raise StopIteration


class CustomObjectBase:
    pass
