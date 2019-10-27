import sys
import os
import io
import fnmatch
from shutil import rmtree
from setuptools import find_packages, setup, Command, Extension
from setuptools.command.build_py import build_py as build_py_orig
from Cython.Build import cythonize

from aim.__version__ import __version__


here = os.path.abspath(os.path.dirname(__file__))

# Get packages
packages = find_packages(exclude=('tests',))

# Package meta-data.
NAME = 'aim-cli'
DESCRIPTION = 'AI Deployment tool'
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
]

# List of extensions to compile
extensions = [
    # aim
    Extension('aim.*', ['aim/*.py']),

    # aim cli packages
    Extension('aim.cli.*', ['aim/cli/*.py']),
    Extension('aim.cli.auth.*', ['aim/cli/auth/*.py']),
    Extension('aim.cli.init.*', ['aim/cli/init/*.py']),
    Extension('aim.cli.push.*', ['aim/cli/push/*.py']),
    Extension('aim.cli.remote.*', ['aim/cli/remote/*.py']),
    Extension('aim.cli.branch.*', ['aim/cli/branch/*.py']),

    # aim sdk packages
    Extension('aim.sdk.*', ['aim/sdk/*.py']),
    Extension('aim.sdk.artifacts.*', ['aim/sdk/artifacts/*.py']),

    # Other packages
    Extension('aim.engine.*', ['aim/engine/*.py']),
]

# List of file name patterns to exclude from cythonizing
# e.g '**/__init__.py'
cython_excludes = []


# Define helper functions
def not_cythonized(tup):
    (package, module, file_path) = tup

    return any(
        fnmatch.fnmatchcase(file_path, pat=pattern)
        for pattern in cython_excludes
    ) or not any(
        fnmatch.fnmatchcase(file_path, pat=pattern)
        for ext in extensions
        for pattern in ext.sources
    )

# def ls_dir(paths):
#     if len(paths) == 0:
#         return []
#
#     if os.path.isdir(paths[0]):
#         ls_head = [os.path.join(paths[0], i) for i in os.listdir(paths[0])]
#         return ls_dir(ls_head + (paths[1:] if len(paths) > 1 else []))
#     else:
#         return [paths[0]] + (ls_dir(paths[1:]) if len(paths) > 1 else [])
#
# def get_resource_files(pkg_name, resource_dir='resource_files'):
#     dir_path = os.path.join(*pkg_name.split('.'))
#     resource_dir_path = os.path.join(dir_path, resource_dir)
#
#     if not os.path.isdir(resource_dir_path):
#         return {'': None}
#
#     file_paths = ls_dir([resource_dir_path])
#
#     return file_paths


# Define commands
class CompileCommand(Command):
    '''Support setup.py compile.
    '''

    description = 'Compile and build the package.'
    user_options = []

    @staticmethod
    def status(s):
        '''Prints things in bold.
        '''
        print('\033[1m{0}\033[0m'.format(s))

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        try:
            self.status('Removing previous builds…')
            rmtree(os.path.join(here, 'dist'))
            rmtree(os.path.join(here, 'build'))
        except OSError:
            pass

        self.status('Building wheel distribution…')
        os.system(
            '{0} setup.py build_py build_ext bdist_wheel '
            .format(sys.executable))


class UploadCommand(Command):
    '''Support setup.py upload.
    '''

    description = 'Publish the package.'
    user_options = []

    @staticmethod
    def status(s):
        '''Prints things in bold.
        '''
        print('\033[1m{0}\033[0m'.format(s))

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        self.status('Uploading the package to PyPI via Twine…')
        os.system('twine upload dist/*')

        # self.status('Pushing git tags…')
        # os.system('git tag v{0}'.format(VERSION))
        # os.system('git push --tags')


class BuildPyCommand(build_py_orig):
    def find_modules(self):
        modules = super().find_modules()
        return list(filter(not_cythonized, modules))

    def find_package_modules(self, package, package_dir):
        modules = super().find_package_modules(package, package_dir)
        return list(filter(not_cythonized, modules))


# Where the magic happens
setup(
    name=NAME,
    version=VERSION,
    description=DESCRIPTION,
    long_description=LONG_DESCRIPTION,
    python_requires=REQUIRES_PYTHON,
    install_requires=REQUIRED,
    packages=packages,
    ext_modules=cythonize(extensions,
                          build_dir='build',
                          compiler_directives=dict(
                              always_allow_keywords=True
                          ),
                          exclude=cython_excludes),
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
        'build_py': BuildPyCommand,
        'compile': CompileCommand,
        'upload': UploadCommand,
    },
)
