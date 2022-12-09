## Installing on Windows

### Prerequisites

Visual Studio 2019 or 2022. The free edition (Community Edition) is supported .

### Overview

Create an empty directory and place inside the build scripts (`.bat` files) with the content described below. Then run them in sequential order.

### 1-build-deps.bat

```batchfile
git clone -b 2022.11.14 https://github.com/Microsoft/vcpkg.git

cd vcpkg

call bootstrap-vcpkg.bat -disableMetrics

vcpkg install rocksdb[bzip2,lz4,snappy,zlib,zstd]:x64-windows-static-md

cd ..
```

### 2-create-venv.bat

You need to edit the script to select the Python version that you require. You can either use the Windows Python Launcher (`py -3.10`) or you can directly specify the path to the Python installation (`C:\Program Files\Python 3.10\python.exe`, ...)

```batchfile
py -3.10 -m venv venv
rem "C:\Program Files\Python 3.10\python.exe" -m venv venv

call venv\Scripts\activate.bat

python -m pip install -U pip setuptools wheel

pip install pytest Cython==3.0.0.a9
```

### 3-build-aimrocks.bat

```batchfile
call venv\Scripts\activate.bat

git clone https://github.com/aimhubio/aimrocks.git

cd aimrocks

python setup.py bdist_wheel

pip install --find-links=dist aimrocks

cd ..
```

### 4-build-aim.bat

```batchfile
call venv\Scripts\activate.bat

git clone https://github.com/aimhubio/aim.git

cd aim

python setup.py bdist_wheel

pip install --find-links=dist aim

cd ..
```

### 5-run-aim.bat

```batchfile
call venv\Scripts\activate.bat

aim version
aim init
aim up
```
