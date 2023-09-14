import sys

from types import new_class
from typing import Union, List

from aim._core.storage.object import CustomObject as AimStorageObject
from aim._sdk.blob import BLOB


@AimStorageObject.alias('aim.Record')
class Record(AimStorageObject):
    AIM_NAME = 'aim.Record'
    RESOLVE_BLOBS = False

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if 'SEQUENCE_NAME' in cls.__dict__:
            from aim._sdk.sequence import Sequence
            if 'SEQUENCE_BASE_TYPE' in cls.__dict__:
                base_cls = cls.SEQUENCE_BASE_TYPE
                sequence_cls = type(cls.SEQUENCE_NAME, (base_cls,), {
                    '__record_type__': Union[cls, List[cls]]
                })
            else:
                sequence_cls = new_class(cls.SEQUENCE_NAME, (Sequence[Union[cls, List[cls]]],), {})
            module = sys.modules[cls.__module__]
            setattr(module, cls.SEQUENCE_NAME, sequence_cls)

    @classmethod
    def get_full_typename(cls):
        if cls == Record:
            return cls.get_typename()
        # if hasattr(cls, 'extends'):
        #     extended_cls = getattr(cls, 'extends')
        #     assert issubclass(extended_cls, Object)

        for base in cls.__bases__:
            if issubclass(base, Record):
                base_typename = base.get_full_typename()
                typename = cls.get_typename()
                return '->'.join((base_typename, typename))

    @staticmethod
    def extends(co_cls):
        assert issubclass(co_cls, Record)

        def decorator(cls):
            setattr(cls, '__extends', co_cls)
            return cls

        return decorator

    def dump(self):
        # TODO: V4 handle nested blob values
        data = self.storage[...]

        keys_list = list(data.keys())
        for key in keys_list:
            if isinstance(data[key], BLOB):
                if self.RESOLVE_BLOBS:
                    data[key] = data[key].load()
                else:
                    del data[key]

        return data
