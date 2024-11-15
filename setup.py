import os
import sys

from shutil import rmtree

from aimrocks import lib_utils
from Cython.Build import cythonize
from setuptools import Command, Extension, find_packages, setup


# TODO This `setup.py` assumes that `Cython` and `aimrocks` are installed.
# This is okay for now as users are expected to install `aim` from wheels.

version_file = 'aim/VERSION'

with open(version_file) as vf:
    __version__ = vf.read().strip()

here = os.path.abspath(os.path.dirname(__file__))

# Package meta-data.
NAME = 'aim'
DESCRIPTION = 'A super-easy way to record, search and compare AI experiments.'
VERSION = __version__
REQUIRES_PYTHON = '>=3.7.0'

# Get packages
packages = find_packages(exclude=('tests', 'performance_tests', 'aim.web.ui'))


# Get a list of all files in the html directory to include in our module
def package_files(directory):
    paths = []
    for path, _, filenames in os.walk(directory):
        for filename in filenames:
            paths.append(os.path.join('..', path, filename))
    return paths


migration_files = package_files('aim/web/migrations')
storage_migration_files = package_files('aim/storage/migrations')
notifier_files = package_files('aim/ext/notifier')
version_files = [
    '../aim/VERSION',
]

readme_file = 'README.md'
readme_text = open('/'.join((here, readme_file)), encoding='utf-8').read()
LONG_DESCRIPTION = readme_text.strip()

SETUP_REQUIRED = [
    'Cython==3.0.10',
]

# What packages are required for this module to be executed?
REQUIRED = [
    f'aim-ui=={__version__}',
    'aimrecords==0.0.7',
    'aimrocks==0.5.*',
    'cachetools>=4.0.0',
    'click>=7.0',
    'cryptography>=3.0',
    'filelock<4,>=3.3.0',
    'numpy<3,>=1.12.0',
    'psutil>=5.6.7',
    'RestrictedPython>=5.1',
    'tqdm>=4.20.0',
    'aiofiles>=0.5.0',
    'alembic<2,>=1.5.0',
    'fastapi<1,>=0.69.0',
    'jinja2<4,>=2.10.0',
    'pytz>=2019.1',
    'SQLAlchemy>=1.4.1',
    'uvicorn<1,>=0.12.0',
    'Pillow>=8.0.0',
    'packaging>=15.0',
    'python-dateutil',
    'requests',
    'websockets',
    'boto3',
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


INCLUDE_DIRS = [lib_utils.get_include_dir()]
LIB_DIRS = [lib_utils.get_lib_dir()]
LIBS = lib_utils.get_libs()
COMPILE_ARGS = ['-std=c++11', '-O3', '-Wall', '-Wextra', '-Wconversion', '-fno-strict-aliasing', '-fno-rtti', '-fPIC']
CYTHON_SCRITPS = [
    ('aim.storage.hashing.c_hash', 'aim/storage/hashing/c_hash.pyx'),
    ('aim.storage.hashing.hashing', 'aim/storage/hashing/hashing.py'),
    ('aim.storage.hashing', 'aim/storage/hashing/__init__.py'),
    ('aim.storage.encoding.encoding_native', 'aim/storage/encoding/encoding_native.pyx'),
    ('aim.storage.encoding.encoding', 'aim/storage/encoding/encoding.pyx'),
    ('aim.storage.encoding', 'aim/storage/encoding/__init__.py'),
    ('aim.storage.treeutils', 'aim/storage/treeutils.pyx'),
    ('aim.storage.rockscontainer', 'aim/storage/rockscontainer.pyx'),
    ('aim.storage.union', 'aim/storage/union.pyx'),
    ('aim.storage.arrayview', 'aim/storage/arrayview.py'),
    ('aim.storage.treearrayview', 'aim/storage/treearrayview.py'),
    ('aim.storage.treeview', 'aim/storage/treeview.py'),
    ('aim.storage.utils', 'aim/storage/utils.py'),
    ('aim.storage.container', 'aim/storage/container.py'),
    ('aim.storage.containertreeview', 'aim/storage/containertreeview.py'),
    ('aim.storage.inmemorytreeview', 'aim/storage/inmemorytreeview.py'),
    ('aim.storage.prefixview', 'aim/storage/prefixview.py'),
]


def configure_extension(name: str, path: str):
    """Configure an extension and bind with third-party libs"""
    if isinstance(path, str):
        path = [path]
    return Extension(
        name,
        path,
        language='c++',
        include_dirs=INCLUDE_DIRS,
        libraries=LIBS,
        library_dirs=LIB_DIRS,
        extra_compile_args=COMPILE_ARGS,
    )


def cytonize_extensions():
    """Configure and Cythonize all the extensions"""
    extensions = []
    for name, path in CYTHON_SCRITPS:
        extensions.append(configure_extension(name, path))
    return cythonize(extensions, show_all_warnings=True)


# Where the magic happens
setup(
    name=NAME,
    version=VERSION,
    description=DESCRIPTION,
    long_description=LONG_DESCRIPTION,
    long_description_content_type='text/markdown',
    python_requires=REQUIRES_PYTHON,
    setup_requires=SETUP_REQUIRED,
    install_requires=REQUIRED,
    packages=packages,
    package_data={'aim': migration_files + storage_migration_files + notifier_files + version_files},
    include_package_data=True,
    classifiers=[
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: Implementation :: PyPy',
    ],
    ext_modules=cytonize_extensions(),
    entry_points={
        'console_scripts': [
            'aim=aim.cli.cli:cli_entry_point',
            'aim-watcher=aim.cli.watcher_cli:cli_entry_point',
        ],
    },
    cmdclass={'upload': UploadCommand},
)
