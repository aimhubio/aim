import os

here = os.path.abspath(os.path.dirname(__file__))

version_file = f'{here}/VERSION'


__version__ = None
with open(version_file) as vf:
    __version__ = vf.read().strip()
