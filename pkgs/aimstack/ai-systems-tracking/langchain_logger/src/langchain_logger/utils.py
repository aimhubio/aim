import os
import random


def get_version():
    here = os.path.abspath(os.path.dirname(__file__))
    version_file = os.path.join(here, 'VERSION')
    with open(version_file) as vf:
        __version__ = vf.read().strip()
    return __version__


def get_user():
    usernames = [
        'JamesThompson',
        'LisaHamilton',
        'RobertFitzgerald',
        'MariaGonzalez',
        'DavidMorrison',
    ]
    username = random.choice(usernames)
    return username
