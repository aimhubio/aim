import os

from setuptools import find_packages, setup

here = os.path.abspath(os.path.dirname(__file__))

# Package info
NAME = "llamaindex_logger"
DESCRIPTION = "A LlamaIndex logger"
VERSION = "0.1.0"
REQUIRES_PYTHON = ">=3.7.0"

setup(
    name=NAME,
    version=VERSION,
    description=DESCRIPTION,
    python_requires=REQUIRES_PYTHON,
    packages=find_packages("src"),
    package_dir={"": "src"},
    zip_safe=False,
)
