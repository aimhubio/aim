#!/bin/bash

set -e

# OVERVIEW
# This script overwrites nbserverproxy package to https://github.com/aimhubio/jupyter-server-proxy
# The main idea is to support proxying through /proxy/absolute/<port> and resolve the corrupted headers issue for body supported http requests

# PARAMETERS
PIP_PACKAGE_NAME=nbserverproxy
AIM_FORKED_PACKAGE_SOURCE=git+https://github.com/aimhubio/jupyter-server-proxy

source /home/ec2-user/anaconda3/bin/activate JupyterSystemEnv

pip uninstall --yes $PIP_PACKAGE_NAME
pip install $AIM_FORKED_PACKAGE_SOURCE

initctl restart jupyter-server --no-wait
