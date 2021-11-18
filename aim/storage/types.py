from typing import Callable, Dict, List, Tuple, Union, Generic, TypeVar
from copy import deepcopy


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


BLOBLoader = Callable[[], AimObjectPrimitive]
T = TypeVar('T')


class BLOB(Generic[T]):
    def __init__(
        self,
        data: T = None,
        loader_fn: 'BLOBLoader' = None
    ):
        self.data: T = data
        self.loader_fn = loader_fn

    def __bytes__(self):
        return bytes(self.load())

    def load(self) -> T:
        if self.data is None:
            assert self.loader_fn is not None
            self.data = self.loader_fn()
            self.loader_fn = None
        return self.data

    def __deepcopy__(self, memo):
        data = self.load()
        instance = self.__class__(data=deepcopy(data, memo=memo))
        memo[id(self)] = instance
        return instance

    def transform(
        self,
        transform_fn: Callable[[AimObjectPrimitive], T]
    ) -> 'BLOB':
        if self.data is not None:
            return self.__class__(transform_fn(self.data))

        def loader():
            return transform_fn(self.load())

        return self.__class__(loader_fn=loader)


__all__ = [
    'NoneType',
    'AimObjectKey',
    'AimObjectPath',
    'AimObjectPrimitive',
    'AimObjectArray',
    'AimObjectDict',
    'AimObject',
    'CustomObjectBase',
    'SafeNone',
    'BLOB',
    'BLOBLoader',
]
