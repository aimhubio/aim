#!/bin/bash
set -e

cd /opt/aim

export PATH=/opt/python/${PYTHON_VERSION}/bin:$PATH
python -m pip cache purge
echo "build wheels for ${PYTHON_VERSION}"
python -m pip install build
python -m pip install setuptools
python -m build
pip install dist/*${PYTHON_VERSION}*.whl
pip install git+https://github.com/aimhubio/auditwheel.git@include-exclude-new
export LIB_DIR=`python -c "from aimrocks import lib_utils; print(lib_utils.get_lib_dir())"`
export LIBS_BUNDLED=`ls ${LIB_DIR}/ \
  | grep .so \
  | sed -r 's/^(lib.*?\.so)\.*?$/\1/g' \
  | uniq \
  | paste -s -d','`
export LD_LIBRARY_PATH=$LIB_DIR:$LD_LIBRARY_PATH
auditwheel repair \
  --exclude $LIBS_BUNDLED --wheel-dir multilinux_dist \
  dist/*${PYTHON_VERSION}*.whl


echo "python wheels build. SUCCESS"
echo "DONE"