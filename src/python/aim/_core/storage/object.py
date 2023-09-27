from typing import Dict

from aim._core.storage.types import CustomObjectBase
from aim._core.storage.inmemorytreeview import InMemoryTreeView


class CustomObject(CustomObjectBase):
    registry: Dict[str, type] = {}

    def __init__(self):
        pass

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if hasattr(cls, 'AIM_NAME'):
            CustomObject.registry[cls.AIM_NAME] = cls
        return cls

    @staticmethod
    def alias(name: str, exist_ok: bool = True):
        def decorator(cls):
            if name in CustomObject.registry and not exist_ok:
                raise ValueError(f'CustomObject `{name}` is already registered')
            CustomObject.registry[name] = cls
            return cls

        return decorator

    @staticmethod
    def by_name(name: str):
        try:
            return CustomObject.registry[name]
        except KeyError:
            return CustomObjectProxy

    @classmethod
    def get_typename(cls) -> str:
        # TODO [AT, MV] check AIM_NAME to have python type name format (f.e. "aim._sdk.Image" but not "abc//}?")
        return cls.AIM_NAME

    def __new__(cls, *args, **kwargs):
        obj = super().__new__(cls)
        obj.storage = kwargs.get('_storage', InMemoryTreeView(container={}))
        return obj

    def __deepcopy__(self, memodict=None):
        if memodict is None:
            memodict = {}

        cls = self.__class__
        # TODO Implement `__deepcopy__` in `TreeView`
        storage = InMemoryTreeView(container=self.storage[...])
        result = cls.__new__(cls, _storage=storage)
        memodict[id(self)] = result
        return result

    def _aim_encode(self):
        # TODO more effective
        return self.AIM_NAME, self.storage[...]

    @classmethod
    def _aim_decode(cls, aim_name, storage):
        custom_cls = cls.by_name(aim_name)
        obj = cls.__new__(custom_cls, _storage=storage)
        setattr(obj, '_cls_name', aim_name)
        return obj


class CustomObjectProxy(CustomObject):
    def _aim_encode(self):
        return self._cls_name, self.storage[...]
