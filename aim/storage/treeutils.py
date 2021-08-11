from aim.storage import encoding as E
from aim.storage.types import AimObject, AimObjectPath
from aim.storage.utils import ArrayFlag, ObjectFlag

from typing import Any, Iterator, List, Tuple, Union


def unfold_tree(
    obj: AimObject,
    *,
    path: Tuple[Union[int, str], ...] = (),
    unfold_array: bool = True,
    depth: int = None
) -> Iterator[Tuple[Tuple[Union[int, str], ...], Any]]:
    if depth == 0:
        yield path, obj
        return
    if depth is not None:
        depth -= 1

    if obj is None:
        yield path, obj
    elif isinstance(obj, (bool, int, float, str, bytes)):
        yield path, obj
    elif isinstance(obj, (list, tuple)):
        if not unfold_array:
            yield path, obj
        else:
            yield path, ArrayFlag
            # Ellipsis (...) is set when array elements are expected
            for idx, val in enumerate(obj):
                yield from unfold_tree(val, path=path + (idx,), unfold_array=unfold_array, depth=depth)
    elif isinstance(obj, dict):
        # yield path, ObjectFlag
        for key, val in obj.items():
            yield from unfold_tree(val, path=path + (key,), unfold_array=unfold_array, depth=depth)
    else:
        raise NotImplementedError


def val_to_node(
    val: Any,
    strict: bool = True
) -> Any:
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
    else:
        return val


def fold_tree(
    paths_vals: Iterator[Tuple[Tuple[Union[int, str], ...], Any]],
    strict: bool = True
) -> AimObject:
    (keys, val), = iter_fold_tree(paths_vals,
                                  level=0, strict=strict)
    # TODO raise KeyError here
    return val


def iter_fold_tree(
    paths_vals: Iterator[Tuple[Tuple[Union[int, str], ...], Any]],
    *,
    level: int = 0,
    strict: bool = True
) -> Iterator[Tuple[AimObjectPath, AimObject]]:
    stack = []
    path = []

    try:
        keys, val = next(paths_vals)
        # assert not keys
        if keys:
            raise StopIteration
        node = val_to_node(val)
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
                yield tuple(path), last_state
            path.pop()

        node = val_to_node(val, strict=strict)

        if len(keys) == len(path):
            # override with new
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
        else:
            raise ValueError
        stack.append(node)


    if level < len(stack):
        yield tuple(path[:level]), stack[level]



def encode_paths_vals(
    paths_vals: Iterator[Tuple[Tuple[Union[int, str], ...], Any]]
) -> Iterator[Tuple[bytes, bytes]]:
    for path, val in paths_vals:
        path = E.encode_path(path)
        val = E.encode(val)
        yield path, val


def decode_paths_vals(
    paths_vals: Iterator[Tuple[bytes, bytes]]
) -> Iterator[Tuple[Tuple[Union[int, str], ...], Any]]:
    current_path: List[Union[int, str]] = None

    for encoded_path, encoded_val in paths_vals:
        path = E.decode_path(encoded_path)
        val = E.decode(encoded_val)
        # go back

        if current_path is None:
            if path:
                yield (), ObjectFlag
            current_path = []
        elif current_path == path:
            continue

        idx = 0
        new_path = []
        while idx < len(current_path):
            key = path[idx]
            if key != current_path[idx]:
                break
            new_path.append(key)
            idx += 1
        current_path = new_path

        while idx < len(path):
            current_path.append(path[idx])
            if idx < len(path):
                yield tuple(current_path), ObjectFlag
            idx += 1

        yield tuple(path), val


def encode_tree(
    obj: AimObject
) -> Iterator[Tuple[bytes, bytes]]:
    return encode_paths_vals(
        unfold_tree(obj)
    )


def decode_tree(
    paths_vals: Iterator[Tuple[bytes, bytes]],
    strict: bool = True
) -> AimObject:
    return fold_tree(
        decode_paths_vals(paths_vals),
        strict=strict
    )


def iter_decode_tree(
    paths_vals: Iterator[Tuple[bytes, bytes]],
    level: int = 1
):
    return iter_fold_tree(
        decode_paths_vals(paths_vals),
        level=level
    )
