import os
import json
from copy import deepcopy
from functools import reduce
from random import choice
from string import ascii_letters
from importlib import import_module
import shutil
import zipfile


def deep_merge(*dicts, update=False):
    """
    Merges dicts deeply
    """
    def merge_into(d1, d2):
        for key in d2:
            if key not in d1 or not isinstance(d1[key], dict):
                d1[key] = deepcopy(d2[key])
            else:
                d1[key] = merge_into(d1[key], d2[key])
        return d1

    if update:
        return reduce(merge_into, dicts[1:], dicts[0])
    else:
        return reduce(merge_into, dicts, {})


def deep_compare(a, b, order_matter=True):
    return json.dumps(a) == json.dumps(b)
    # TODO: Implement deep comparison not taking into account ordering


def is_path_creatable(path):
    """
    `True` if current user has sufficient permissions to create the passed
    path or `False` otherwise.
    """
    dir_name = os.path.dirname(path)
    return os.access(dir_name, os.W_OK)


def ls_dir(paths):
    """
    List the files in directories
    """
    if len(paths) == 0:
        return []

    if os.path.isdir(paths[0]):
        ls_head = [os.path.join(paths[0], i) for i in os.listdir(paths[0])]
        return ls_dir(ls_head + (paths[1:] if len(paths) > 1 else []))
    else:
        return [paths[0]] + (ls_dir(paths[1:]) if len(paths) > 1 else [])


def random_str(string_length=10):
    """
    Generate a random string of fixed length
    """
    return ''.join(choice(ascii_letters) for _ in range(string_length))


def compressed_dict(item):
    stack = list(item.items())
    ans = {}
    while stack:
        key, val = stack.pop()
        if isinstance(val, dict):
            for sub_key, sub_val in val.items():
                stack.append(('{}.{}'.format(key, sub_key), sub_val))
        else:
            ans[key] = val
    return ans


def get_inst_type_str(inst):
    """
    Get instance type and class type full names
    """
    obj_name = obj_module = obj_cls_name = obj_cls_module = ''

    if hasattr(inst, '__name__'):
        obj_name = inst.__name__
    if hasattr(inst, '__module__'):
        obj_module = inst.__module__
    if hasattr(inst, '__class__'):
        if hasattr(inst.__class__, '__name__'):
            obj_cls_name = inst.__class__.__name__
        if hasattr(inst.__class__, '__module__'):
            obj_cls_module = inst.__class__.__module__

    obj_full = '{}.{}'.format(obj_name, obj_module)
    obj_cls_full = '{}.{}'.format(obj_cls_name, obj_cls_module)

    return obj_full, obj_cls_full


def get_inst_base_types(inst):
    """
    Get instance and it's base classes types
    """
    bases_types = []
    for b in inst.__class__.__bases__:
        b_type, b_cls_type = get_inst_type_str(b)
        bases_types.append(b_type)
        bases_types.append(b_cls_type)
    return bases_types


def inst_has_typename(inst, types):
    """
    Return `True` if the instance is created from class
    which has base that matches passed `types`
    """
    inst_type, inst_cls_type = get_inst_type_str(inst)
    inst_types = [inst_type, inst_cls_type] + get_inst_base_types(inst)

    for i in inst_types:
        found = True
        for t in types:
            if i.find(t) == -1:
                found = False
                break
        if found:
            return True

    return False


def is_keras_model(inst):
    """
    Check whether `inst` is instance of keras model
    """
    return inst_has_typename(inst, ['keras', 'Model'])


def is_pytorch_module(inst):
    """
    Check whether `inst` is instance of pytorch module
    """
    return inst_has_typename(inst, ['torch', 'Module'])


def is_tensorflow_session(inst):
    """
    Check whether `inst` is instance of tensorflow session
    """
    return inst_has_typename(inst, ['tensorflow', 'session'])


def is_tensorflow_estimator(inst):
    """
    Check whether `inst` is instance of tensorflow estimator
    """
    return inst_has_typename(inst, ['tensorflow', 'estimator'])


def is_pytorch_optim(inst):
    """
    Check whether `inst` is instance of pytorch optimizer
    """
    return inst_has_typename(inst, ['torch', 'optim'])


def is_pytorch_tensor(inst):
    """
    Check whether `inst` is instance of pytorch tensor
    """
    return inst_has_typename(inst, ['torch', 'Tensor'])


def is_numpy_array(inst):
    """
    Check whether `inst` is instance of numpy array
    """
    return inst_has_typename(inst, ['numpy', 'ndarray'])


def is_numpy_number(inst):
    """
    Check whether `inst` is numpy number and convert to python native type
    """
    if inst_has_typename(inst, ['numpy']):
        converted_val = inst.item()
        if isinstance(converted_val, (int, float)):
            return True, converted_val
    return False, None


def convert_to_py_number(value):
    """
    Converts numpy objects or tensors to python number types
    """
    if isinstance(value, (int, float)):
        return value

    np_number, converted_val = is_numpy_number(value)
    if np_number:
        return converted_val

    if is_pytorch_tensor(value):
        return value.item()

    return value


def get_module(name, required=True):
    """
    Return specified module or None otherwise,
    raise ValueError if module is required
    """
    try:
        return import_module(name)
    except Exception:
        if required:
            raise ValueError('no module named: \'{}\''.format(name))
        return None


def archive_dir(zip_path, dir_path):
    """
    Archive a directory
    """
    zip_file = zipfile.ZipFile(zip_path, 'w')
    with zip_file:
        # Writing each file one by one
        for file in ls_dir([dir_path]):
            zip_file.write(file, file[len(dir_path):])

    # Remove model directory
    shutil.rmtree(dir_path)


def clean_repo_path(repo_path: str) -> str:
    if not isinstance(repo_path, str) or not repo_path:
        return ''

    repo_path = repo_path.strip().rstrip('/')

    if repo_path == '.':
        return os.getcwd()
    if repo_path == '~':
        return os.path.expanduser('~')

    if repo_path.endswith('.aim'):
        repo_path = repo_path[:-4]
    if repo_path.startswith('~'):
        repo_path = os.path.expanduser('~') + repo_path[1:]

    return os.path.abspath(repo_path)
