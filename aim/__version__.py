version_file = 'VERSION'

__version__ = None
with open(version_file) as vf:
    __version__ = vf.read().strip()

