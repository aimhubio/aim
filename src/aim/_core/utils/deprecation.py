import logging

logger = logging.getLogger(__name__)

DEFAULT_MSG_TEMPLATE = 'This functionality will be removed in'


def sqlalchemy_version_check():
    import sqlalchemy
    import packaging.version
    from aim.__version__ import __version__
    if packaging.version.parse(sqlalchemy.__version__) >= packaging.version.parse('2.0.0'):
        raise RuntimeError(f'Aim v{__version__} does not support sqlalchemy v{sqlalchemy.__version__}. '
                           f'Please check the following issue for further updates: '
                           f'https://github.com/aimhubio/aim/issues/2514')


def python_version_deprecation_check():
    import sys
    version_info = sys.version_info
    if version_info.major == 3 and version_info.minor == 6:
        deprecation_warning(remove_version='3.16',
                            msg='Python 3.6 has reached EOL. Aim support for Python 3.6 is deprecated!',
                            remove_msg_template='Python 3.6 support will be dropped in')


def deprecation_warning(*, remove_version: str, msg: str, remove_msg_template: str = DEFAULT_MSG_TEMPLATE):
    logger.warning(msg)
    logger.warning(f'{remove_msg_template} Aim version {remove_version}')
