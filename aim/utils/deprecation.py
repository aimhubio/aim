import logging

logger = logging.getLogger(__name__)


def python_version_deprecation_check():
    import sys
    version_info = sys.version_info
    if version_info.major == 3:
        deprecation_warning(remove_version='3.16', msg='Python 3.6 has reached EOL. '
                                                       'Aim support for Python 3.6 is deprecated!')


def deprecation_warning(*, remove_version: str, msg: str):
    logger.warning(f'{msg} This functionality will be removed in Aim version {remove_version}.')
