from aim.storage.container import Container
from aim.storage.containertreeview import ContainerTreeView

from typing import Iterator, Tuple


class PrefixView(Container):
    """
    A mutable view to a :obj:`Container` given by a key prefix.

    Args:
        prefix (:obj:`bytes`): the prefix that defines the key range of the
            view-container. The resulting container will share an access to
            only records in the `prefix` key range, but with `prefix`-es
            stripped from them.

            For example, if the Container contents are:
            `{
                b'e.y': b'012',
                b'meta.x': b'123',
                b'meta.z': b'x',
                b'zzz': b'oOo'
            }`, then `container.view(prefix=b'meta.')` will behave (almost)
            exactly as an Container:
            `{
                b'x': b'123',
                b'z': b'x',
            }`
        container (:obj:`Container`): the parent container to build the view on
    """

    def __init__(
        self,
        *,
        prefix: bytes = b'',
        container: Container,
        read_only: bool = None
    ) -> None:
        self.prefix = prefix
        self.container = container

        self.read_only = read_only

    def close(self):
        """Close all the resources."""
        pass

    def preload(self):
        """Preload the Container.

        The interface of Container is designed in such a way that (almost) all
        the operations are supported to be done lazily.
        Sometimes there is need to preload the storage without performing an
        operation that will cause an actual read / write access.
        """
        self.container.preload()

    def finalize(self, *, index: Container):
        """Finalize the Container.

        Perform operations of compactions, indexing, optimization, etc.
        """
        prefix = self.absolute_path()
        # Shadowing
        index.delete_range(prefix, prefix + b'\xff')  # TODO check validity
        self.container.finalize(index=index)

    def absolute_path(
        self,
        *args: bytes
    ) -> bytes:
        return Container.path_join(prefix=self.prefix, *args)

    def get(
        self,
        key: bytes,
        default=None
    ) -> bytes:
        """Returns the value by the given `key` if it exists else `default`.

        The `default` is :obj:`None` by default.
        """
        path = self.absolute_path(key)
        return self.container.get(path, default)

    def __getitem__(
        self,
        key: bytes
    ) -> bytes:
        """Returns the value by the given `key`."""
        path = self.absolute_path(key)
        return self.container[path]

    def set(
        self,
        key: bytes,
        value: bytes,
        *,
        store_batch=None
    ) -> None:
        """Set a value for given key, optionally store in a batch.

        If `store_batch` is provided, instead of the `(key, value)` being added
        to the collection immediately, the operation is stored in a batch in
        order to be executed in a whole with other write operations. Depending
        on the :obj:`Conainer` implementation, this may feature transactions,
        atomic writes, etc.
        """
        path = self.absolute_path(key)
        self.container.set(path, value, store_batch=store_batch)

    def __setitem__(
        self,
        key: bytes,
        value: bytes
    ) -> None:
        """Set a value for given key."""
        path = self.absolute_path(key)
        self.container[path] = value

    def delete(
        self,
        key: bytes,
        *,
        store_batch=None
    ):
        """Delete a key-value record by the given key,
        optionally store in a batch.

        If `store_batch` is provided, instead of the `(key, value)` being added
        to the collection immediately, the operation is stored in a batch in
        order to be executed in a whole with other write operations. Depending
        on the :obj:`Conainer` implementation, this may feature transactions,
        atomic writes, etc.
        """
        path = self.absolute_path(key)
        return self.container.delete(path, store_batch=store_batch)

    def __delitem__(
        self,
        key: bytes
    ) -> None:
        """Delete a key-value record by the given key."""
        path = self.absolute_path(key)
        del self.container[path]

    def delete_range(
        self,
        begin: bytes,
        end: bytes,
        store_batch=None
    ):
        """Delete all the records in the given `[begin, end)` key range."""
        begin_path = self.absolute_path(begin)
        end_path = self.absolute_path(end)
        return self.container.delete_range(begin_path, end_path,
                                           store_batch=store_batch)

    def next_key(
        self,
        key: bytes = b''
    ) -> bytes:
        """Returns the key that comes (lexicographically) right after the
        provided `key`.
        """
        path = self.absolute_path(key)
        keys = self.container.next_key(path)
        if path:
            _prefix, _path, keys = keys.partition(path)
            assert not _prefix and _path == path
        return keys

    def next_value(
        self,
        key: bytes = b''
    ) -> bytes:
        """Returns the value for the key that comes (lexicographically) right
        after the provided `key`.
        """
        path = self.absolute_path(key)
        keys, value = self.container.next_key_value(path)
        if path:
            _prefix, _path, keys = keys.partition(path)
            if _prefix or _path != path:
                raise KeyError
        return value

    def next_key_value(
        self,
        key: bytes = b''
    ) -> Tuple[bytes, bytes]:
        """Returns `(key, value)` for the key that comes (lexicographically)
        right after the provided `key`.
        """
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
        """Returns the key that comes (lexicographically) right before the
        provided `key`.
        """
        path = self.absolute_path(key)
        keys = self.container.prev_key(path)
        if path:
            _prefix, _path, keys = keys.partition(path)
            if _prefix or _path != path:
                raise KeyError
        return keys

    def prev_value(
        self,
        key: bytes = b''
    ) -> bytes:
        """Returns the value for the key that comes (lexicographically) right
        before the provided `key`.
        """
        path = self.absolute_path(key)
        keys, value = self.container.prev_key_value(path)
        if path:
            _prefix, _path, keys = keys.partition(path)
            if _prefix or _path != path:
                raise KeyError
        return value

    def prev_key_value(
        self,
        key: bytes = b''
    ) -> Tuple[bytes, bytes]:
        """Returns `(key, value)` for the key that comes (lexicographically)
        right before the provided `key`.
        """
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
        """A bi-directional generator to walk over the collection of records on
        any arbitrary order. The `prefix` sent to the generator (lets call it
        a `walker`) seeks for lower-bound key in the collection.

        In other words, if the Container contents are:
        `{
            b'e.y': b'012',
            b'meta.x': b'123',
            b'meta.z': b'x',
            b'zzz': b'oOo'
        }` and `walker = container.walk()` then:
        `walker.send(b'meta') == b'meta.x'`, `walker.send(b'e.y') == b'e.y'`
        """
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

    def items(
        self,
        key: bytes = b''
    ) -> Iterator[Tuple[bytes, bytes]]:
        """Iterate over all the key-value records in the prefix key range.

        The iteration is always performed in lexiographic order w.r.t keys.
        If `prefix` is provided, iterate only over those records that have key
        starting with the `prefix`.

        For example, if `prefix == b'meta.'`, and the Container consists of:
        `{
            b'e.y': b'012',
            b'meta.x': b'123',
            b'meta.z': b'x',
            b'zzz': b'oOo'
        }`, the method will yield `(b'meta.x', b'123')` and `(b'meta.z', b'x')`

        Args:
            prefix (:obj:`bytes`): the prefix that defines the key range
        """
        path = self.absolute_path(key)
        for keys, val in self.container.items(path):
            yield keys[len(path):], val

    def keys(
        self,
        key: bytes = b''
    ) -> Iterator[bytes]:
        """Iterate over all the keys in the prefix range.

        The iteration is always performed in lexiographic order.
        If `prefix` is provided, iterate only over keys starting with
        the `prefix`.

        For example, if `prefix == b'meta.'`, and the Container consists of:
        `{
            b'e.y': b'012',
            b'meta.x': b'123',
            b'meta.z': b'x',
            b'zzz': b'oOo'
        }`, the method will yield `b'meta.x'` and `b'meta.z'`

        Args:
            prefix (:obj:`bytes`): the prefix that defines the key range
        """
        path = self.absolute_path(key)
        for keys in self.container.keys(path):
            keys = keys[len(path):]
            yield keys

    def values(
        self,
        key: bytes = b''
    ) -> Iterator[bytes]:
        """Iterate over all the values in the given prefix key range.

        The iteration is always performed in lexiographic order w.r.t keys.
        If `prefix` is provided, iterate only over those record values that have
        key starting with the `prefix`.

        For example, if `prefix == b'meta.'`, and the Container consists of:
        `{
            b'e.y': b'012',
            b'meta.x': b'123',
            b'meta.z': b'x',
            b'zzz': b'oOo'
        }`, the method will yield `b'123'` and `b'x'`

        Args:
            prefix (:obj:`bytes`): the prefix that defines the key range
        """
        path = self.absolute_path(key)
        for values in self.container.values(path):
            yield values

    def view(
        self,
        prefix: bytes = b''
    ) -> Container:
        """Return a view (even mutable ones) that enable access to the container
        but with modifications.

        Args:
            prefix (:obj:`bytes`): the prefix that defines the key range of the
                view-container. The resulting container will share an access to
                only records in the `prefix` key range, but with `prefix`-es
                stripped from them.

                For example, if the Container contents are:
                `{
                    b'e.y': b'012',
                    b'meta.x': b'123',
                    b'meta.z': b'x',
                    b'zzz': b'oOo'
                }`, then `container.view(prefix=b'meta.')` will behave (almost)
                exactly as an Container:
                `{
                    b'x': b'123',
                    b'z': b'x',
                }`
        """
        # TODO *args instead?
        return self.container.view(self.prefix + prefix)

    def tree(
        self
    ) -> ContainerTreeView:
        """Return a :obj:`ContainerTreeView` which enables hierarchical view and access
        to the container records.

        This is achieved by prefixing groups and using `PATH_SENTINEL` as a
        separator for keys.

        For example, if the Container contents are:
            `{
                b'e.y': b'012',
                b'meta.x': b'123',
                b'meta.z': b'x',
                b'zzz': b'oOo'
            }`, and the path sentinel is `b'.'` then `tree = container.tree()`
            will behave as a (possibly deep) dict-like object:
            `tree[b'meta'][b'x'] == b'123'`
        """
        return ContainerTreeView(self)

    def batch(self):
        """Creates a new batch object to store operations in before executing
        using :obj:`Container.commit`.

        The operations :obj:`Container.set`, :obj:`Container.delete`,
        :obj:`Container.delete_range` are supported.

        See more at :obj:`Container.commit`
        """
        return self.container.batch()

    def commit(
        self,
        batch
    ):
        """Execute the accumulated write operations in the given `batch`.

        Depending on the :obj:`Container` implementation, this may feature
        transactions, atomic writes, etc.
        """
        return self.container.commit(batch)
