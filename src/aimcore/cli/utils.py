import os
import logging
from aim._sdk.configs import AIM_LOG_LEVEL_KEY


def set_log_level(log_level):
    numeric_level = getattr(logging, log_level.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError('Invalid log level: %s' % log_level)
    os.environ[AIM_LOG_LEVEL_KEY] = str(numeric_level)
    logging.basicConfig(level=numeric_level)


def start_uvicorn_app(app: str, **uvicorn_args):
    import uvicorn
    uvicorn.run(app, **uvicorn_args)


def get_free_port_num():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    port_num = s.getsockname()[1]
    s.close()
    return port_num
