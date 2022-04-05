from copy import deepcopy

import aimrocks.lib_rocksdb as interfaces  # noqa: F401


class KeysIterator:
    def __init__(self, items_iterator):
        self.it = items_iterator

    def __iter__(self):
        return self

    def __next__(self):
        key, _ = next(self.it)
        return key


class ValuesIterator:
    def __init__(self, items_iterator):
        self.it = items_iterator

    def __iter__(self):
        return self

    def __next__(self):
        _, value = next(self.it)
        return value


class ArrayFlagType:
    def __repr__(self):
        return "<ArrayFlag>"

    def __copy__(self) -> 'ArrayFlagType':
        return self

    def __deepcopy__(self, memo) -> 'ArrayFlagType':
        return self


ArrayFlag = ArrayFlagType()


class ObjectFlagType:
    def __repr__(self):
        return "<ObjectFlag>"

    def __copy__(self) -> 'ObjectFlagType':
        return self

    def __deepcopy__(self, memo) -> 'ObjectFlagType':
        return self


ObjectFlag = ObjectFlagType()


class CustomObjectFlagType:
    def __init__(self, aim_name: str):
        self.aim_name = aim_name

    def __repr__(self):
        return f"<CustomObjectFlag type={self.aim_name}>"


class BLOB:
    def __init__(
        self,
        data=None,
        loader_fn=None
    ):
        self.data = data
        self.loader_fn = loader_fn

    def __bytes__(self):
        return bytes(self.load())

    def __len__(self):
        return len(bytes(self))

    def load(self):
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

    def transform(self, transform_fn):
        if self.data is not None:
            return self.__class__(transform_fn(self.data))

        def loader():
            return transform_fn(self.load())

        return self.__class__(loader_fn=loader)
