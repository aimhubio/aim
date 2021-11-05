from typing import Callable, Dict, List, Tuple, Union


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


BLOBResolver = Callable[[], bytes]


class BLOB:
    def __init__(
        self,
        data: bytes = None,
        resolver: 'BLOBResolver' = None
    ):
        self.data = data
        self.resolver = resolver

    def __bytes__(self):
        return self.resolve()

    def resolve(self):
        if self.data is None:
            assert self.resolver is not None
            self.data = self.resolver()
            self.resolver = None
        return self.data

    def __deepcopy__(self, memo):
        data = bytes(self)
        instance = self.__class__(data=data)
        memo[id(self)] = instance
        return instance

    def transform(
        self,
        transform: Callable[[bytes], bytes]
    ) -> 'BLOB':
        if self.data is not None:
            return self.__class__(transform(self.data))

        resolver = lambda: transform(bytes(self))
        return self.__class__(resolver=resolver)


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
    'BLOBResolver',
]
