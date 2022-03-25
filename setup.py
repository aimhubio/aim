import sys
import os
import io
from shutil import rmtree
from setuptools import find_packages, setup, Command, Extension
from Cython.Build import cythonize

version_file = 'aim/VERSION'

__version__ = None
with open(version_file) as vf:
    __version__ = vf.read().strip()


here = os.path.abspath(os.path.dirname(__file__))

# Package meta-data.
NAME = 'aim'
DESCRIPTION = 'A super-easy way to record, search and compare AI experiments.'
VERSION = __version__
REQUIRES_PYTHON = '>=3.6.0'

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
storage_migration_files = package_files('aim/storage/migrations')
version_files = ['../aim/VERSION', ]

# TODO: Get long description from the README file
LONG_DESCRIPTION = DESCRIPTION

SETUP_REQUIRED = [
    'Cython==3.0.0a9',
]

# What packages are required for this module to be executed?
REQUIRED = [
    'aimrecords==0.0.7',
    'aimrocks==0.1.0',
    'cachetools>=4.0.0',
    'click>=7.0',
    'cryptography>=3.0',
    'filelock>=3.0.0',
    'GitPython>=3.0.4',
    'numpy>=1.12.0',
    'packaging>=19.0',
    'protobuf>=3.11.0',
    'psutil>=5.6.7',
    'py3nvml>=0.2.5',
    'RestrictedPython>=5.1',
    'tqdm>=4.20.0',
    'aiofiles>=0.5.0',
    'alembic>=1.4.0',
    'async-exit-stack>=1.0.0',
    'async-generator>=1.0',
    'fastapi>=0.65.0,<0.68.0',
    'jinja2>=2.10.0,<3.1.0',
    'pytz>=2019.1',
    'SQLAlchemy>=1.4.1',
    'uvicorn>=0.12.0',
    'Pillow>=8.1.0',
    'grpcio==1.42.0',
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
        try:
            self.status('Removing previous builds…')
            rmtree(os.path.join(here, 'dist'))
        except OSError:
            pass

        self.status('Cleaning build directory')
        os.system('{} setup.py clean --all'.format(sys.executable))

        self.status('Building Source and Wheel (universal) distribution…')
        os.system(f'{sys.executable} setup.py sdist bdist_wheel --universal')

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
    setup_requires=SETUP_REQUIRED,
    install_requires=REQUIRED,
    packages=packages,
    package_data={'aim': ui_files + migration_files + storage_migration_files + version_files},
    include_package_data=True,
    classifiers=[
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: Implementation :: PyPy'
    ],
    ext_modules=cythonize([
        Extension(
            'aim.storage.hashing.c_hash',
            ['aim/storage/hashing/c_hash.pyx'],
            language='c++'
        ),
        Extension(
            'aim.storage.hashing.hashing',
            ['aim/storage/hashing/hashing.py'],
            language='c++'
        ),
        Extension(
            'aim.storage.hashing',
            ['aim/storage/hashing/__init__.py'],
            language='c++'
        ),
        Extension(
            'aim.storage.encoding.encoding_native',
            ['aim/storage/encoding/encoding_native.pyx'],
            language='c++'
        ),
        Extension(
            'aim.storage.encoding.encoding',
            ['aim/storage/encoding/encoding.pyx'],
            language='c++'
        ),
        Extension(
            'aim.storage.encoding',
            ['aim/storage/encoding/__init__.py'],
            language='c++'
        ),
        Extension(
            'aim.storage.treeutils',
            ['aim/storage/treeutils.pyx'],
            language='c++'
        ),
        Extension(
            'aim.storage.rockscontainer',
            ['aim/storage/rockscontainer.pyx'],
            language='c++'
        ),
        Extension(
            'aim.storage.union',
            ['aim/storage/union.pyx'],
            language='c++'
        ),
        Extension(
            'aim.storage.arrayview',
            ['aim/storage/arrayview.py'],
            language='c++'
        ),
        Extension(
            'aim.storage.treearrayview',
            ['aim/storage/treearrayview.py'],
            language='c++'
        ),
        Extension(
            'aim.storage.treeview',
            ['aim/storage/treeview.py'],
            language='c++'
        ),
        Extension(
            'aim.storage.utils',
            ['aim/storage/utils.py'],
            language='c++'
        ),
    ]),
    entry_points={
        'console_scripts': [
            'aim=aim.cli.cli:cli_entry_point',
        ],
    },
    cmdclass={
        'upload': UploadCommand
    },
)
