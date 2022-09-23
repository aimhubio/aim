import logging

logger = logging.getLogger(__name__)


def deprecation_warning(*, remove_version: str, msg: str):
    logger.warning(f'{msg} This functionality will be removed in version {remove_version}.')
