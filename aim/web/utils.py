from importlib import import_module
import os
import subprocess

from aim.web.configs import AIM_UI_MOUNTED_REPO_PATH
from aim.sdk.utils import clean_repo_path


class ShellCommandException(Exception):
    pass


def exec_cmd(
    cmd, throw_on_error=True, env=None, stream_output=False, cwd=None, cmd_stdin=None, **kwargs
):
    """
    Runs a command as a child process.
    A convenience wrapper for running a command from a Python script.
    Keyword arguments:
    cmd -- the command to run, as a list of strings
    throw_on_error -- if true, raises an Exception if the exit code of the program is nonzero
    env -- additional environment variables to be defined when running the child process
    cwd -- working directory for child process
    stream_output -- if true, does not capture standard output and error; if false, captures these
      streams and returns them
    cmd_stdin -- if specified, passes the specified string as stdin to the child process.
    Note on the return value: If stream_output is true, then only the exit code is returned. If
    stream_output is false, then a tuple of the exit code, standard output and standard error is
    returned.
    """
    cmd_env = os.environ.copy()
    if env:
        cmd_env.update(env)
    if stream_output:
        child = subprocess.Popen(
            cmd, env=cmd_env, cwd=cwd, universal_newlines=True, stdin=subprocess.PIPE, **kwargs
        )
        child.communicate(cmd_stdin)
        exit_code = child.wait()
        if throw_on_error and exit_code != 0:
            raise ShellCommandException("Non-zero exitcode: %s" % (exit_code))
        return exit_code
    else:
        child = subprocess.Popen(
            cmd,
            env=cmd_env,
            stdout=subprocess.PIPE,
            stdin=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=cwd,
            universal_newlines=True,
            **kwargs
        )
        (stdout, stderr) = child.communicate(cmd_stdin)
        exit_code = child.wait()
        if throw_on_error and exit_code != 0:
            raise ShellCommandException(
                "Non-zero exit code: %s\n\nSTDOUT:\n%s\n\nSTDERR:%s" % (exit_code, stdout, stderr)
            )
        return exit_code, stdout, stderr


def get_module(name, required=True):
    try:
        return import_module(name)
    except Exception:
        if required:
            raise ValueError('No module named: \'{}\''.format(name))
        return None


def ls_dir(path):
    """
    List the files in directories
    """
    if not path or not os.path.exists:
        return []

    if os.path.isfile(path):
        return [path]

    ls = []

    for root, _, file_names in os.walk(path):
        for file_name in file_names:
            ls.append(os.path.join(root, file_name))

    return ls


def get_root_path():
    return clean_repo_path(os.getenv(AIM_UI_MOUNTED_REPO_PATH, os.getcwd()))
