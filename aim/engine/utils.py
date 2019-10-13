import os
from copy import deepcopy
from functools import reduce
from random import choice
from string import ascii_letters


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


def is_path_creatable(path):
    """
    `True` if current user has sufficient permissions to create the passed
    path
    `False` otherwise.
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


def is_keras_model(obj):
    """
    Check whether an obj is instance of keras model
    """
    if type(obj).__module__ == 'keras.engine.training' and \
            type(obj).__name__ == 'Model':
        return True
    return False


def is_pytorch_module(obj):
    """
    Check whether an obj is instance of pytorch module
    """
    from torch.nn import Module
    if isinstance(obj, Module):
        return True
    return False
