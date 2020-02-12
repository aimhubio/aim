import sys
import os
import io
from shutil import rmtree
from setuptools import find_packages, setup, Command

from aim.__version__ import __version__


here = os.path.abspath(os.path.dirname(__file__))

# Get packages
packages = find_packages(exclude=('tests',))

# Package meta-data.
NAME = 'aim-cli'
DESCRIPTION = 'Version control for AI'
VERSION = __version__
REQUIRES_PYTHON = '>=3.6.0'

# Get long description from the README file
try:
    with io.open(os.path.join(here, 'README.md'), encoding='utf-8') as f:
        LONG_DESCRIPTION = '\n' + f.read()
except FileNotFoundError:
    LONG_DESCRIPTION = DESCRIPTION

# What packages are required for this module to be executed?
REQUIRED = [
    'click>=6.7',
    'paramiko==2.6.0',
    'GitPython==3.0.4',
    'requests>=2.0.0',
    'psutil>=5.6.7',
    'py3nvml>=0.2.5',
    'docker>=4.1.0',
]


class UploadCommand(Command):
    """Support setup.py upload."""

    description = 'Build and publish the package.'
    user_options = []

    @staticmethod
    def status(s):
        """Prints things in bold."""
        print('\033[1m{0}\033[0m'.format(s))

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        try:
            self.status('Removing previous builds…')
            rmtree(os.path.join(here, 'dist'))
        except OSError:
            pass

        self.status('Building Source and Wheel (universal) distribution…')
        os.system(
            '{0} setup.py sdist bdist_wheel --universal'
            .format(sys.executable))

        self.status('Uploading the package to PyPI via Twine…')
        os.system('twine upload dist/*')

        self.status('Pushing git tags…')
        os.system('git tag v{0}'.format(VERSION))
        os.system('git push --tags')

        sys.exit()


# Where the magic happens
setup(
    name=NAME,
    version=VERSION,
    description=DESCRIPTION,
    long_description=LONG_DESCRIPTION,
    python_requires=REQUIRES_PYTHON,
    install_requires=REQUIRED,
    packages=packages,
    include_package_data=True,
    classifiers=[
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: Implementation :: PyPy'
    ],
    entry_points={
        'console_scripts': [
            'aim=aim.cli.cli:cli_entry_point',
        ],
    },
    cmdclass={
        'upload': UploadCommand
    },
)
