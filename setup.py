import sys
import os
import io
from shutil import rmtree
from setuptools import find_packages, setup, Command

from aim.__version__ import __version__


here = os.path.abspath(os.path.dirname(__file__))

# Package meta-data.
NAME = os.getenv('AIM_PKG_NAME') or 'aim'
DESCRIPTION = 'A super-easy way to record, search and compare AI experiments.'
VERSION = __version__
REQUIRES_PYTHON = '>=3.5.0'

# Get packages
packages = find_packages(exclude=('tests',))

# TODO: Get long description from the README file
LONG_DESCRIPTION = DESCRIPTION

# What packages are required for this module to be executed?
REQUIRED = [
    'click>=6.7',
    'anytree>=2.8.0',
    'pyrser>=0.2.0',
    'GitPython>=3.0.4',
    'requests>=2.0.0',
    'psutil>=5.6.7',
    'docker>=4.1.0',
    'aimrecords==0.0.7',
    'protobuf>=3.11.0',
]


class UploadCommand(Command):
    """Support setup.py upload."""

    description = 'Build and publish the package.'
    user_options = [
        ('rc', None, 'Tag version as a release candidate'),
    ]

    @staticmethod
    def status(s):
        """Prints things in bold."""
        print('\033[1m{0}\033[0m'.format(s))

    def initialize_options(self):
        self.rc = 0

    def finalize_options(self):
        pass

    def run(self):
        for name in ['aim', 'aim-cli']:
            try:
                self.status('Removing previous builds…')
                rmtree(os.path.join(here, 'dist'))
            except OSError:
                pass

            self.status('Building Source and Wheel (universal) distribution…')
            os.system(
                'AIM_PKG_NAME={1} {0} setup.py sdist bdist_wheel --universal'
                .format(sys.executable, name))

            # self.status('Uploading the package to PyPI via Twine…')
            os.system('twine upload dist/*')

        if not self.rc:
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
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
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
