import os

from setuptools import setup

here = os.path.abspath(os.path.dirname(__file__))

version_file = os.path.join(here, '..', '..', 'VERSION')
with open(version_file) as vf:
    __version__ = vf.read().strip()

# Package meta-data.
NAME = 'aim-webui'
DESCRIPTION = 'Aim Web UI'
VERSION = __version__


def package_files(directory):
    paths = []
    for (path, _, filenames) in os.walk(directory):
        for filename in filenames:
            paths.append(os.path.join(path, filename))
    return paths


ui_files = package_files('build')

setup(
    name=NAME,
    version=__version__,
    description=DESCRIPTION,
    packages=["aim.web.ui"],
    package_dir={'aim.web.ui': '.'},
    package_data={'aim.web.ui': ui_files}
)
