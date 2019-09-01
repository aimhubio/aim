import os


def is_path_creatable(path):
    """
    `True` if current user has sufficient permissions to create the passed
    path
    `False` otherwise.
    """
    dir_name = os.path.dirname(path)
    return os.access(dir_name, os.W_OK)
