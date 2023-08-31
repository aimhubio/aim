import aimrocks

from .record import Record
from .sequence import Sequence
from .container import Container, Property
from .repo import Repo

from aim._ext.notebook.notebook import load_ipython_extension

from aim._core.utils.deprecation import python_version_deprecation_check
from aim._ext.tracking import analytics
from aim._sdk.package_utils import register_aimstack_packages, register_package

__all__ = ['Record', 'Sequence', 'Container', 'Repo', 'Property', 'register_package']
__aim_types__ = [Sequence, Container, Record]

# python_version_deprecation_check()
analytics.track_install_event()

register_aimstack_packages()
