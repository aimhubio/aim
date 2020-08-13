import os
import json
import re

from aim.engine.utils import random_str
from aim.engine.configs import \
    AIM_PROFILE_NAME, \
    AIM_PROFILE_SSH_DIR_NAME,\
    AIM_PROFILE_CONFIG_FILE_NAME


class AimProfile:
    @staticmethod
    def get_path():
        """
        Returns aim profile path, by default at user's home directory
        """
        home_path = os.path.expanduser('~')
        aim_profile_path = os.path.join(home_path, AIM_PROFILE_NAME)

        return aim_profile_path

    def __init__(self):
        self.path = self.get_path()
        self.config_path = os.path.join(self.path, AIM_PROFILE_CONFIG_FILE_NAME)
        self.ssh_path = os.path.join(self.path, AIM_PROFILE_SSH_DIR_NAME)
        self._config = {}

        if not os.path.isdir(self.path):
            self.init()

    @property
    def config(self):
        """
        Config property getter, loads config file if not already loaded and
        returns json object
        """
        if len(self._config) == 0:
            if os.path.isfile(self.config_path):
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                self._config = config
        return self._config

    @config.setter
    def config(self, config):
        self._config = config

    def save_config(self):
        """
        Saves object config to config file
        """
        with open(self.config_path, 'w') as f:
            f.write(json.dumps(self._config))

    def init(self):
        """
        Inits aim profile at default path
        """
        # Create profile dir
        os.mkdir(self.path)

        # Create ssh dir
        os.mkdir(self.ssh_path)

        # Create known_hosts file inside ssh dir
        open(os.path.join(self.ssh_path, 'known_hosts'), 'w').close()

        # Create profile config file
        with open(self.config_path, 'w') as profile_file:
            profile_file.write(json.dumps({
                'auth': {},
            }))

    def is_auth(self, remote):
        """
        Returns `True` if profile has authentication keys for `remote`,
        `False` otherwise
        """
        return self.config['auth'].get(remote) is not None

    def get_username(self):
        """
        Returns username or None
        """
        user = self.config.get('user')
        if user:
            return user.get('username')
        return None

    def set_username(self, username):
        """
        Sets username
        """
        if not isinstance(username, str):
            raise TypeError()

        if not re.match(r'^[A-Za-z0-9_\-]{2,}$', username):
            raise AttributeError()

        self.config.setdefault('user', {})
        self.config['user']['username'] = username.strip()
        self.save_config()

    # def auth(self, remote):
    #     """
    #     Generates RSA key pair for `remote` authentication
    #     """
    #     remote = remote.strip()
    #     private_file_name = 'rsa_{r}'.format(o=remote,
    #                                          r=random_str(16))
    #     private_key_path = os.path.join(self.ssh_path, private_file_name)
    #
    #     # Generate rsa key
    #     k = paramiko.RSAKey.generate(bits=4 * 1024)
    #
    #     # Save keys inside ssh dir
    #     k.write_private_key_file(private_key_path, password=None)
    #     public_key = k.get_base64()
    #     with open('{}.pub'.format(private_key_path), 'w') as pub_file:
    #         pub_file.write(public_key)
    #
    #     # Save auth detail into config file
    #     self.config['auth'][remote] = {
    #         'key': private_key_path,
    #     }
    #     self.save_config()
    #
    #     return {
    #         'private_key_path': private_key_path,
    #         'public_key': public_key,
    #     }
