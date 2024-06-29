import os
import time


here = os.path.abspath(os.path.dirname(__file__))

version_file = f'{here}/VERSION'

__version__ = None
with open(version_file) as vf:
    __version__ = vf.read().strip()

_this_year = time.strftime('%Y')
__author__ = 'Gev Sogomonian, Gor Arakelyan et al.'
__author_email__ = 'community@aimhub.io'
__license__ = 'Apache-2.0'
__copyright__ = f'2019-{_this_year}, {__author__}.'
__homepage__ = 'https://github.com/aimhubio/aim'
__docs_url__ = 'https://github.com/aimhubio/aim'
# this has to be simple string, see: https://github.com/pypa/twine/issues/522
__docs__ = 'Aim is a lightweight library for ML researchers to store and retrieve AI metadata.'
__long_docs__ = """
"""

__all__ = ['__author__', '__author_email__', '__copyright__', '__docs__', '__homepage__', '__license__', '__version__']
