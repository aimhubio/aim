import weakref
import aimrocks

from aim.storage import encoding as E
from aim.storage.containerview import ContainerView
from aim.storage.treeview import TreeView

from typing import Iterable, Iterator, Tuple, Union



class SingleContainerView(ContainerView):
    """
    View to Container given by key prefix
    """

    # TODO implement queue

    def __init__(
        self,
        *,
        prefix: bytes = b'',
        container: ContainerView,
        # TODO writable_container: ContainerView = None,
        read_only: bool = None  # TODO container may be in write mode but we may view it in read-only
    ) -> None:
        self.prefix = prefix
        self.container = container

        self.read_only = read_only

    def preload(self):
        try:
            self.container.preload()
        except:
            pass

    def absolute_path(
        self,
        *args: Iterable[bytes]
    ) -> bytes:
        return ContainerView.path_join(prefix=self.prefix, *args)

    def batch_set(
        self,
        key: bytes,
        value: bytes,
        *,
        store_batch: aimrocks.WriteBatch = None
    ) -> None:
        path = self.absolute_path(key)
        self.container.batch_set(path, value, store_batch=store_batch)

    def __setitem__(
        self,
        key: bytes,
        value: bytes
    ) -> None:
        path = self.absolute_path(key)
        self.container[path] = value

    def __getitem__(
        self,
        key: bytes
    ) -> bytes:
        path = self.absolute_path(key)
        return self.container[path]

    def __delitem__(
        self,
        key: bytes
    ) -> None:
        path = self.absolute_path(key)
        del self.container[path]

    def batch_delete(
        self,
        key: bytes,
        store_batch: aimrocks.WriteBatch = None
    ):
        path = self.absolute_path(key)
        return self.container.batch_delete(path, store_batch=store_batch)

    def next_key(
        self,
        key: bytes = b''
    ) -> bytes:
        path = self.absolute_path(key)
        keys = self.container.next_key(path)
        if path:
            _prefix, _path, keys = keys.partition(path)
            assert not _prefix and _path == path
        return keys

    def next_key_value(
        self,
        key: bytes = b''
    ) -> Tuple[bytes, bytes]:
        path = self.absolute_path(key)
        keys, value = self.container.next_key_value(path)
        if path:
            _prefix, _path, keys = keys.partition(path)
            if _prefix or _path != path:
                raise KeyError
        return keys, value

    def prev_key(
        self,
        key: bytes = b''
    ) -> bytes:
        path = self.absolute_path(key)
        keys = self.container.prev_key(path)
        if path:
            _prefix, _path, keys = keys.partition(path)
            if _prefix or _path != path:
                raise KeyError
        return keys

    def prev_key_value(
        self,
        key: bytes = b''
    ) -> Tuple[bytes, bytes]:
        path = self.absolute_path(key)
        keys, value = self.container.prev_key_value(path)
        if path:
            _prefix, _path, keys = keys.partition(path)
            if _prefix or _path != path:
                raise KeyError
        return keys, value

    def walk(
        self,
        key: bytes = b''
    ):
        path = self.absolute_path(key)
        walker = self.container.walk(path)
        p = None
        while True:
            if p is None:
                next_key = next(walker)
            else:
                next_key = walker.send(p)
            if next_key is None:
                return
            if path:
                _prefix, _path, next_key = next_key.partition(path)
                # assert not _prefix and _path == path
                if _prefix or _path != path:
                    return

            key = yield next_key
            p = self.absolute_path(key)

    def iterlevel(
        self,
        key: bytes = b''
    ) -> Iterator[Tuple[bytes, bytes]]:
        path = self.absolute_path(key)
        for keys, val in self.container.iterlevel(path):
            assert keys.startswith(path)
            _prefix, _path, keys = keys.partition(path)
            assert not _prefix and _path == path
            yield keys, val

    def items(
        self,
        key: bytes = b''
    ) -> Iterator[Tuple[bytes, bytes]]:
        path = self.absolute_path(key)
        for keys, val in self.container.items(path):
            # assert keys.startswith(path)
            yield keys[len(path):], val

    def keys(
        self,
        key: bytes = b''
    ) -> Iterator[bytes]:
        path = self.absolute_path(key)
        for keys in self.container.keys(path):
            assert keys.startswith(path)
            keys = keys[len(path):]
            yield keys

    def view(
        self,
        prefix: bytes = b''
    ) -> ContainerView:
        # TODO *args instead?
        return SingleContainerView(prefix=self.prefix + prefix,
                                   container=self.container)

    def tree(
        self
    ) -> TreeView:
        return TreeView(self)

    def commit(
        self,
        batch
    ):
        # TODO better wrap WriteBatch
        return self.container.commit(batch)
