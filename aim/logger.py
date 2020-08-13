""" Aim logging configuration management """

import logging
import logging.config
import os

from aim.engine.configs import *
from aim.engine.repo import AimRepo


class LoggerHandlerActivities(logging.FileHandler):
    def __init__(self):
        repo = AimRepo(os.getcwd())
        log_path = os.path.join(repo.get_logs_dir(), AIM_CLI_ACTIVITIED_LOG)
        logging.FileHandler.__init__(self, log_path, 'a')


class LoggerHandlerErrors(logging.FileHandler):
    def __init__(self):
        repo = AimRepo(os.getcwd())
        log_path = os.path.join(repo.get_logs_dir(), AIM_SDK_ERROR_LOG)
        logging.FileHandler.__init__(self, log_path, 'a')


def activity_logger():
    repo = AimRepo(os.getcwd())
    if repo is not None:
        setup()
        return logging.getLogger('activity')
    return None


def error_logger():
    repo = AimRepo(os.getcwd())
    if repo is not None:
        setup()
        return logging.getLogger('error')
    return None


def setup():
    logging.config.dictConfig(
        {
            'version': 1,
            'formatters': {
                'activity_format': {
                    'format': 'Date: %(asctime)s\n\x1b[33;21mActivity: %(message)s\n',
                    'datefmt': '%a %b %d %H:%M:%S %Y %z'},
                'error_format': {
                    'format': 'Date: %(asctime)s\n\x1b[31;21mError: %(message)s',
                    'datefmt': '%a %b %d %H:%M:%S %Y %z'}},
            'handlers': {
                'activity_handler': {
                    'class': 'aim.logger.LoggerHandlerActivities',
                    'level': 'DEBUG',
                    'formatter': 'activity_format'},
                'error_handler': {
                    'class': 'aim.logger.LoggerHandlerErrors',
                    'level': 'ERROR',
                    'formatter': 'error_format'}},
            'loggers': {
                'activity': {
                    'level': 'DEBUG',
                    'handlers': ['activity_handler'],
                    'propagate': 'no'},
                'error': {
                    'level': 'ERROR',
                    'handlers': ['error_handler'],
                    'propagate': 'no'}}})
