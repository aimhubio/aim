import os

from setuptools import setup

here = os.path.abspath(os.path.dirname(__file__))

version_file = os.path.join(here, 'aim_ui/VERSION')
with open(version_file) as vf:
    __version__ = vf.read().strip()

# Package meta-data.
NAME = 'aim-ui'
DESCRIPTION = 'Aim UI'
VERSION = __version__


def package_files(directory):
    paths = []
    for (path, _, filenames) in os.walk(directory):
        for filename in filenames:
            paths.append(os.path.join('..', path, filename))
    return paths


# These are symlinks to main files
files = package_files('aim_ui/build')
files.append('../aim_ui/VERSION')

setup(
    name=NAME,
    version=__version__,
    description=DESCRIPTION,
    packages=['aim_ui'],
    package_data={'aim_ui': files}
)
