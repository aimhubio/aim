import logging


logger = logging.getLogger(__name__)

DEFAULT_MSG_TEMPLATE = 'This functionality will be removed in'


def python_version_deprecation_check():
    import sys

    version_info = sys.version_info
    if version_info.major == 3 and version_info.minor == 7:
        deprecation_warning(
            remove_version='3.30',
            msg='Python 3.7 has reached EOL. Aim support for Python 3.7 is deprecated!',
            remove_msg_template='Python 3.7 support will be dropped in',
        )


def deprecation_warning(*, remove_version: str, msg: str, remove_msg_template: str = DEFAULT_MSG_TEMPLATE):
    logger.warning(msg)
    logger.warning(f'{remove_msg_template} Aim version {remove_version}')
