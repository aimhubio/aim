import os
import psutil
import signal
import subprocess
import threading
from time import sleep

from aim.engine.configs import *
from aim.engine.repo import AimRepo


class Command:
    def __init__(self, data):
        self.name = data.get('name')
        self.script_path = data.get('script_path')
        self.arguments = data.get('arguments')
        self.interpreter_path = data.get('interpreter_path')
        self.working_dir = data.get('working_dir')
        self.process_uuid = data.get('process_uuid')

        # Parse env vars
        parsed_vars = self._parse_env_vars(data.get('env_vars'))
        self.automated_info = parsed_vars
        self.env_vars = parsed_vars['env_vars']

        self.command = self.build_command()

        self.process = None
        self.pid = None
        self.stdout = None
        self.stderr = None
        self.alive = True
        self._thread = threading.Thread(target=self._exec, daemon=True)

    def start(self):
        self._thread.start()
        while True:
            if self.pid:
                return self.pid
            else:
                sleep(0.01)

    def kill(self):
        try:
            current_process = psutil.Process(self.pid)
            children = current_process.children(recursive=True)
            for child in children:
                os.kill(child.pid, signal.SIGINT)
            os.kill(self.pid, signal.SIGINT)
            self._thread.join()
        except Exception as e:
            pass
        self.alive = False

    def build_command(self):
        script_path = self.script_path
        arguments = self.arguments or ''
        interpreter_path = self.interpreter_path or 'python'
        env_vars = self.env_vars

        work_dir = ''
        if self.working_dir:
            work_dir = 'cd {} && '.format(self.working_dir)

        command = ('{work_dir} {env_vars} {interpt} ' +
                   '{script_path} {arguments}').format(work_dir=work_dir,
                                                       env_vars=env_vars,
                                                       interpt=interpreter_path,
                                                       script_path=script_path,
                                                       arguments=arguments)
        return command

    def _parse_env_vars(self, env_vars):
        env_vars = env_vars or ''
        env_vars_arr = env_vars.split(' ')
        filtered_env_vars = []

        automated = False
        automated_branch = None
        automated_commit = None
        for e in env_vars_arr:
            if AIM_AUTOMATED_EXEC_ENV_VAR in e:
                automated = True
            elif AIM_BRANCH_ENV_VAR in e:
                _, _, automated_branch = e.rpartition('=')
            else:
                filtered_env_vars.append(e)

        if automated:
            if not automated_branch:
                automated_branch = AIM_DEFAULT_BRANCH_NAME
            automated_commit = AimRepo.generate_commit_hash()

            filtered_env_vars.append('{}={}'.format(AIM_BRANCH_ENV_VAR,
                                                    automated_branch))
            filtered_env_vars.append('{}={}'.format(AIM_COMMIT_ENV_VAR,
                                                    automated_commit))
            filtered_env_vars.append('{}={}'.format(AIM_PROCESS_ENV_VAR,
                                                    self.process_uuid))
            filtered_env_vars.append('{}=1'.format(AIM_AUTOMATED_EXEC_ENV_VAR))

        return {
            'env_vars': ' '.join(filtered_env_vars),
            'automated': automated,
            'automated_branch': automated_branch,
            'automated_commit': automated_commit,
        }

    def _exec(self):
        self.process = subprocess.Popen(self.command,
                                        shell=True,
                                        stdout=subprocess.PIPE,
                                        stderr=subprocess.PIPE,
                                        stdin=subprocess.PIPE,
                                        # preexec_fn=self.preexec
                                        )
        self.pid = self.process.pid
        self.stdout, self.stderr = self.process.communicate()
        self.alive = False

    # def preexec(self):
    #     # Don't forward signals.
    #     import os
    #     os.setpgrp()
