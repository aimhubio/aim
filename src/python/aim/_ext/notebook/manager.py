import subprocess
import time
import enum

# Error message prefix for aim commands
ERROR_MSG_PREFIX = 'Error:'


class ManagerActionStatuses(enum.Enum):
    Failed = 1,
    Succeed = 2,


class ManagerActionResult:
    """
        Object returned by manager action
        If status is ManagerActionStatuses.Failed the info dict should have a message property
        If status is ManagerActionStatuses.Succeed the info dict should have required properties for the specific action
        @TODO add type checking for info fields
    """
    def __init__(self, status: ManagerActionStatuses, info: dict = None):
        self.status = status
        self.info = info


def run_up(args):
    def check_startup_success():
        import requests
        server_path = 'http://{}:{}{}'.format(args['--host'], args['--port'], args['--base-path'])
        status_api = f'{server_path}/api/projects/status'
        retry_count = 5
        sleep_interval = 1
        for _ in range(retry_count):
            try:
                response = requests.get(status_api)
                if response.status_code == 200:
                    return True
            except Exception:
                pass
            sleep_interval += 1
            time.sleep(sleep_interval)

        return False

    args_list = ['--log-level=error']
    for p in args.keys():
        if p != '--proxy-url':
            args_list.append(p + '=' + args[p])

    child_process = subprocess.Popen(
        ['aim', 'ui'] + args_list + ['-y'],
        stderr=subprocess.PIPE,
        stdout=subprocess.PIPE
    )
    # Runs `aim ui <args>` command
    info = {
        'port': args['--port'],
        'host': 'http://' + args['--host']
    }

    if check_startup_success():
        return ManagerActionResult(
            ManagerActionStatuses.Succeed,
            info
        )

    for line in child_process.stderr:
        if ERROR_MSG_PREFIX in line.decode():
            return ManagerActionResult(
                ManagerActionStatuses.Failed,
                {'message': line.decode()}
            )

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
    from aim.__version__ import __version__

    return ManagerActionResult(
        ManagerActionStatuses.Succeed,
        {'version': __version__}
    )
