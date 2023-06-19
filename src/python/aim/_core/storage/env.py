import cython
import pyximport

import logging
logger = logging.getLogger(__name__)


# if not cython.compiled:
pyximport.install(inplace=True,
                  language_level=3,
                  build_in_temp=False,
                  setup_args={'language': 'c++'})


def log_status():
    logger.info(f'compiled: {cython.compiled}')
