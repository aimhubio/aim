import os


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
