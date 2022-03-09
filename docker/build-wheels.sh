#!/bin/bash
set -e

cd /opt/aim

echo "build python wheels"
for python_version in 'cp36-cp36m' 'cp37-cp37m' 'cp38-cp38' 'cp39-cp39' 'cp310-cp310'
do
  PYTHON_ROOT=/opt/python/${python_version}/
  PYTHON_VERSION=`$PYTHON_ROOT/bin/python --version`
  echo "install dev requirements for ${PYTHON_VERSION}"
  $PYTHON_ROOT/bin/pip install -r requirements.dev.txt
  echo "build wheels for ${PYTHON_VERSION}"
  $PYTHON_ROOT/bin/python setup.py bdist_wheel -d linux_dist
done

# produce manylinux wheels
for whl in $(ls ./linux_dist)
do
  auditwheel repair linux_dist/${whl} --wheel-dir multilinux_dist
done

echo "python wheels build. SUCCESS"
echo "DONE"