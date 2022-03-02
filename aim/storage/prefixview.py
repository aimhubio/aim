from aim.storage.container import Container, ContainerItemsIterator, ContainerKey, ContainerValue
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
        self.parent = container

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
        self.parent.preload()

    def finalize(self, *, index: Container):
        """Finalize the Container.

        Perform operations of compactions, indexing, optimization, etc.
        """
        prefix = self.absolute_path()
        # Shadowing
        index.delete_range(prefix, prefix + b'\xff')  # TODO check validity
        self.parent.finalize(index=index)

    def absolute_path(
        self,
        path: bytes = None
    ) -> bytes:
        """Returns the absolute path for the given relative `path`.

        Path separators / sentinels should be handled in higher level so that
        `join(a, b) == a + b` property holds. This can be easily achieved by
        having all the paths end with the sentinel:
        `join('a/b/c/', 'e/f/') == 'a/b/c/' + 'e/f/' = 'a/b/c/e/f/'`
        """
        if path is None:
            return self.prefix
        return self.prefix + path

    def get(
        self,
        key: ContainerKey,
        default=None
    ) -> ContainerValue:
        """Returns the value by the given `key` if it exists else `default`.

        The `default` is :obj:`None` by default.
        """
        path = self.absolute_path(key)
        return self.parent.get(path, default)

    def __getitem__(
        self,
        key: ContainerKey
    ) -> ContainerValue:
        """Returns the value by the given `key`."""
        path = self.absolute_path(key)
        return self.parent[path]

    def set(
        self,
        key: ContainerKey,
        value: ContainerValue,
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
        self.parent.set(path, value, store_batch=store_batch)

    def __setitem__(
        self,
        key: ContainerKey,
        value: ContainerValue
    ) -> None:
        """Set a value for given key."""
        path = self.absolute_path(key)
        self.parent[path] = value

    def delete(
        self,
        key: ContainerKey,
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
        return self.parent.delete(path, store_batch=store_batch)

    def __delitem__(
        self,
        key: ContainerKey
    ) -> None:
        """Delete a key-value record by the given key."""
        path = self.absolute_path(key)
        del self.parent[path]

    def delete_range(
        self,
        begin: ContainerKey,
        end: ContainerKey,
        store_batch=None
    ):
        """Delete all the records in the given `[begin, end)` key range."""
        begin_path = self.absolute_path(begin)
        end_path = self.absolute_path(end)
        self.parent.delete_range(begin_path, end_path,
                                 store_batch=store_batch)

    def next_item(
        self,
        key: ContainerKey = b''
    ) -> Tuple[ContainerKey, ContainerValue]:
        """Returns `(key, value)` for the key that comes (lexicographically)
        right after the provided `key`.
        """
        path = self.absolute_path(key)
        keys, value = self.parent.next_item(path)
        if path:
            _prefix, _path, keys = keys.partition(path)
            if _prefix or _path != path:
                raise KeyError
        return keys, value

    def prev_item(
        self,
        key: ContainerKey = b''
    ) -> Tuple[ContainerKey, ContainerValue]:
        """Returns `(key, value)` for the key that comes (lexicographically)
        right before the provided `key`.
        """
        path = self.absolute_path(key)
        keys, value = self.parent.prev_item(path)
        if path:
            _prefix, _path, keys = keys.partition(path)
            if _prefix or _path != path:
                raise KeyError
        return keys, value

    def walk(
        self,
        key: ContainerKey = b''
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
        walker = self.parent.walk(path)
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
        key: ContainerKey = b''
    ) -> Iterator[Tuple[ContainerKey, ContainerValue]]:
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
        return PrefixViewItemsIterator(self, key)

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
        return self.parent.view(self.prefix + prefix)

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
        return self.parent.batch()

    def commit(
        self,
        batch
    ):
        """Execute the accumulated write operations in the given `batch`.

        Depending on the :obj:`Container` implementation, this may feature
        transactions, atomic writes, etc.
        """
        return self.parent.commit(batch)


class PrefixViewItemsIterator(ContainerItemsIterator):

    def __init__(self, prefix_view, key):
        self.prefix_view = prefix_view
        self.path = prefix_view.absolute_path(key)
        self.it = prefix_view.parent.items(self.path)
        # We store length of the path to strip it from the key faster
        self.prefix_len = len(self.path)

    def next(self):
        item = self.it.next()

        if item is None:
            return None

        keys = item[0]
        value = item[1]

        return keys[self.prefix_len:], value
