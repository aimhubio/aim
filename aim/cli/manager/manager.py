import subprocess
import time
import enum

from aim.cli.configs import VERSION_NAME, UP_NAME
from aim.__version__ import __version__

# Error message prefix for aim commands
ERROR_MSG_PREFIX = 'Error:'


class ManagerActionStatuses(enum.Enum):
    Failed = 1,
    Succeed = 2,


class ManagerActionResult:
    """
        Object to returned by manager action
        If status is ManagerActionStatuses.Failed the info dict should have a message property
        If status is ManagerActionStatuses.Succeed the info dict should have required properties for the specific action
        @TODO add type checking for info fields
    """
    def __init__(self, status: ManagerActionStatuses, info: dict = None):
        self.status = status
        self.info = info


def run_up(args):
    args_list = []
    for p in args.keys():
        if p != '--proxy-url':
            args_list.append(p + '=' + args[p])

    success_msg = 'Open http://{}:{}{}'.format(args['--host'], args['--port'], args['--base-path'])

    child_process = subprocess.Popen(
        ['aim', UP_NAME] + args_list + ['--force-init'],
        stderr=subprocess.PIPE,
        stdout=subprocess.PIPE
    )
    # Runs `aim up <args>` command
    info = {
        'port': args['--port'],
        'host': 'http://' + args['--host']
    }

    for line in child_process.stderr:
        # @TODO improve this solution
        #  The child process `aim cli` has an incompatible things inside
        #  that's the reason to find this way to get result from the process
        if ERROR_MSG_PREFIX in line.decode():
            return ManagerActionResult(
                ManagerActionStatuses.Failed,
                {'message': line.decode()}
            )
        else:
            if success_msg in line.decode():
                time.sleep(2)
                return ManagerActionResult(
                    ManagerActionStatuses.Succeed,
                    info
                )
            else:
                return ManagerActionResult(
                    ManagerActionStatuses.Failed,
                    {
                        'message': '\nPerhaps this is a bug from aim side.'
                                   '\nPlease open an issue https://github.com/aimhubio/aim/issues.'
                    }
                )


def run_version(args):
    """Aim cli command runner to get aim current version
    Returns:
         the current version of aim
    """
    return ManagerActionResult(
        ManagerActionStatuses.Succeed,
        {'version': __version__}
    )


# command runners dict
COMMANDS = {
    UP_NAME: run_up,
    VERSION_NAME: run_version,
    # Perhaps it will need to implement the help command as well
}


def __get_command_runner(command):
    """Returns the runner function of the specified command"""
    return COMMANDS[command]


def validate_command(command):
    """Validate command existence
    """
    return command in (VERSION_NAME, UP_NAME)


def run_process(command, args):
    """
    Returns None if command is not exists
            call the corresponding runner function to  execute aim command `aim <command> <args>`
    """
    if validate_command(command) is not True:
        return ManagerActionResult(
            ManagerActionStatuses.Failed,
            {'message': 'Invalid operation'}
        )

    run = __get_command_runner(command)
    return run(args)
