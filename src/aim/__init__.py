import aimrocks
from aim.sdk import *
from aim.ext.notebook.notebook import load_ipython_extension
from aim.cli.manager.manager import run_process

from aim.core.utils.deprecation import python_version_deprecation_check, sqlalchemy_version_check
from aim.core.utils.tracking import analytics

python_version_deprecation_check()
sqlalchemy_version_check()
analytics.track_install_event()
