from typing import Any, Iterator, Tuple, Union

from aim._core.storage import encoding
from aim._core.storage.encoding.encoding_native cimport decode_path

from aim._core.storage.types import AimObject, AimObjectPath

from aim._core.storage.types import BLOB
from aim._core.storage.utils import ArrayFlag, ObjectFlag, CustomObjectFlagType

from aim._core.storage.object import CustomObjectBase, CustomObject
from aim._core.storage.treeview import TreeView
from aim._core.storage.inmemorytreeview import InMemoryTreeView
from aim._core.storage.treeutils_non_native import convert_to_native_object


def unfold_tree(
    obj: AimObject,
    *,
    path: AimObjectPath = (),
    unfold_array: bool = True,
    depth: int = None,
    strict: bool = True,
) -> Iterator[Tuple[AimObjectPath, Any]]:
    if depth == 0:
        yield path, obj
        return
    if depth is not None:
        depth -= 1

    if obj is None:
        yield path, obj
    elif isinstance(obj, (bool, int, float, str, bytes)):
        yield path, obj
    elif isinstance(obj, BLOB):
        yield path, obj
    elif isinstance(obj, (list, tuple)):
        if not unfold_array:
            yield path, obj
        else:
            yield path, ArrayFlag
            # Ellipsis (...) is set when array elements are expected
            for idx, val in enumerate(obj):
                yield from unfold_tree(val, path=path + (idx,), unfold_array=unfold_array, depth=depth, strict=strict)
    elif isinstance(obj, dict):
        # TODO: set ObjectFlag for all dicts?
        if obj == {}:
            yield path, ObjectFlag
        for key, val in obj.items():
            yield from unfold_tree(val, path=path + (key,), unfold_array=unfold_array, depth=depth, strict=strict)
    elif isinstance(obj, CustomObjectBase):
        aim_name, aim_obj = obj._aim_encode()
        yield path, CustomObjectFlagType(aim_name)
        for key, val in obj.storage.items():
            yield from unfold_tree(val, path=path + (key,), unfold_array=unfold_array, depth=depth, strict=strict)
    elif isinstance(obj, TreeView):
        # TODO we need to implement TreeView.traverse()
        raise NotImplementedError
    else:
        obj = convert_to_native_object(obj, strict=strict)
        yield from unfold_tree(obj, path=path, unfold_array=unfold_array, depth=depth, strict=strict)



cpdef val_to_node(
    val: Any,
    strict: bool = True,
    resolve_objects: bool = False
):
    if not strict:
        node = dict()
        if val == ArrayFlag:
            node['__example_type__'] = str(list)
        elif val != ObjectFlag:
            node['__example_type__'] = str(type(val))
        return node
    if val == ObjectFlag:
        return dict()
    elif val == ArrayFlag:
        return []
    elif isinstance(val, CustomObjectFlagType):
        if resolve_objects:
            return dict()
        else:
            return CustomObject._aim_decode(val.aim_name, InMemoryTreeView(container={}, constructed=False))
    else:
        return val


def fold_tree(
    paths_vals: Iterator[Tuple[AimObjectPath, Any]],
    strict: bool = True,
    resolve_objects: bool = False
) -> AimObject:
    (keys, val), = iter_fold_tree(paths_vals,
                                  level=0, strict=strict, resolve_objects=resolve_objects)
    return val


def iter_fold_tree(
    paths_vals: Iterator[Tuple[AimObjectPath, Any]],
    level: int = 0,
    strict: bool = True,
    resolve_objects: bool = False,
    skip_top_level: bool = False
):
    cdef int idx
    stack = []
    path = []

    try:
        keys, val = next(paths_vals)
        if keys:
            raise StopIteration
        node = val_to_node(val, resolve_objects=resolve_objects)
        # TODO [AT]: fix this
        if skip_top_level and node == []:
            node = {}
        stack.append(node)
    except StopIteration:
        if level > 0:
            return
        else:
            raise KeyError

    for keys, val in paths_vals:
        idx = 0
        while idx < len(path):
            if keys[idx] != path[idx]:
                break
            idx += 1

        while idx < len(path):
            last_state = stack.pop()
            if len(stack) == level:
                if isinstance(last_state, CustomObject):
                    last_state.storage._constructed = True
                yield tuple(path), last_state
            path.pop()

        node = val_to_node(val, strict=strict, resolve_objects=resolve_objects)

        if len(keys) == len(path):
            stack.pop()
            path.pop()

        assert len(keys) == len(path) + 1
        key_to_add = keys[-1]
        path.append(key_to_add)
        assert stack

        if isinstance(stack[-1], list):
            assert isinstance(key_to_add, int)
            if key_to_add < 0:
                raise NotImplementedError
            elif key_to_add < len(stack[-1]):
                stack[-1][key_to_add] = node
            else:
                while len(stack[-1]) != key_to_add:
                    stack[-1].append(None)
                stack[-1].append(node)
        elif isinstance(stack[-1], dict):
            stack[-1][key_to_add] = node
        elif isinstance(stack[-1], CustomObject):
            stack[-1].storage[key_to_add] = node
        else:
            raise ValueError
        stack.append(node)

    if level < len(stack):
        val = stack[level]
        if isinstance(val, CustomObject):
            val.storage._constructed = True
        yield tuple(path[:level]), val

def encode_paths_vals(
    paths_vals: Iterator[Tuple[AimObjectPath, Any]]
) -> Iterator[Tuple[bytes, bytes]]:
    for path, val in paths_vals:
        path = encoding.encode_path(path)
        val = encoding.encode(val)
        yield path, val


cdef class DecodePathsVals(object):
    cdef paths_vals
    cdef current_path
    cdef to_yield
    cdef int num_yielded

    def __cinit__(self, paths_vals):
        self.paths_vals = paths_vals
        self.current_path = None
        self.to_yield = []
        self.num_yielded = 0

    def __iter__(self):
        return self

    def __next__(self):
        return self._next()

    cdef _next(self):
        cdef int idx
        if self.to_yield:
            val = self.to_yield[self.num_yielded]
            self.num_yielded += 1
            if self.num_yielded == len(self.to_yield):
                self.num_yielded = 0
                self.to_yield = []
            return val

        while True:
            encoded_path, encoded_val = next(self.paths_vals)
            path = decode_path(encoded_path)
            val = encoding.decode(encoded_val)

            if self.current_path is None:
                if path:
                    to_yield = (), ObjectFlag
                    self.to_yield.append(to_yield)
                self.current_path = []
                break
            elif self.current_path != path:
                break

        idx = 0
        new_path = []
        while idx < len(self.current_path):
            key = path[idx]
            if key != self.current_path[idx]:
                break
            new_path.append(key)
            idx += 1
        self.current_path = new_path

        while idx < len(path):
            self.current_path.append(path[idx])
            if idx < len(path):
                to_yield = tuple(self.current_path), ObjectFlag
                self.to_yield.append(to_yield)
            idx += 1

        to_yield = tuple(path), val
        self.to_yield.append(to_yield)


        val = self.to_yield[self.num_yielded]
        self.num_yielded += 1
        if self.num_yielded == len(self.to_yield):
            self.num_yielded = 0
            self.to_yield = []
        return val


def encode_tree(
    obj: AimObject,
    strict: bool = True
) -> Iterator[Tuple[bytes, bytes]]:
    return encode_paths_vals(
        unfold_tree(obj, strict=strict)
    )


def decode_tree(
    paths_vals: Iterator[Tuple[bytes, bytes]],
    strict: bool = True,
    resolve_objects: bool = False
) -> AimObject:
    return fold_tree(
        DecodePathsVals(paths_vals),
        strict=strict,
        resolve_objects=resolve_objects
    )


def iter_decode_tree(
    paths_vals: Iterator[Tuple[bytes, bytes]],
    level: int = 1,
    skip_top_level: bool = False
):
    return iter_fold_tree(
        DecodePathsVals(paths_vals),
        level=level,
        skip_top_level=skip_top_level
    )
