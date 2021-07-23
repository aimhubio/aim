#!/bin/bash

cd /opt/aim

echo "build python wheels"
for python_version in 'cp36-cp36m' 'cp37-cp37m' 'cp38-cp38' 'cp39-cp39' 'cp310-cp310'
do
  PYTHON_ROOT=/opt/python/${python_version}/
  # downgrade to pip-18
  $PYTHON_ROOT/bin/pip install --upgrade pip==18
  for pkg_name in 'aim' 'aim-cli'
  do
    export AIM_PKG_NAME=${pkg_name}
    $PYTHON_ROOT/bin/python setup.py bdist_wheel -d linux_dist
  done
done

# produce multilinux wheels
for whl in $(ls ./linux_dist)
do
  auditwheel repair linux_dist/${whl} --wheel-dir multilinux_dist
done

echo "python wheels build. SUCCESS"
echo "DONE"