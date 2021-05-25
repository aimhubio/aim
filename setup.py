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


# Get a list of all files in the html directory to include in our module
def package_files(directory):
    paths = []
    for (path, _, filenames) in os.walk(directory):
        for filename in filenames:
            paths.append(os.path.join('..', path, filename))
    return paths


ui_files = package_files('aim/web/ui/build')
migration_files = package_files('aim/web/migrations')

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
    'py3nvml>=0.2.5',
    'docker>=4.1.0',
    'aimrecords==0.0.7',
    'protobuf>=3.11.0',
    'alembic==1.6.0',
    'Flask==1.1.2',
    'Flask-Cors==3.0.10',
    'Flask-Migrate==2.7.0',
    'Flask-RESTful==0.3.8',
    'Flask-Script==2.0.6',
    'Flask-SQLAlchemy==2.5.1',
    'SQLAlchemy==1.4.13',
    'pysqlite3',
    'pytz==2020.1',
    'tensorboard==2.3.0',
    'gunicorn==20.1.0',
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

            self.status('Cleaning build directory')
            os.system('{} setup.py clean --all'.format(sys.executable))

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
    package_data={'aim': ui_files + migration_files},
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
