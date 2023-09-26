from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from pathlib import Path


init_template = """
__aim_boards__ = 'boards'  # Path to the Aim boards directory relative to the package root.

__aim_types__ = []  # List of Aim Container and Sequence classes available in the package.

__description__ = '{description}'
__author__ = '{author}'
__category__ = '{category}'

# The following lines are auto-generated. Please do not remove them.
from aim import register_package
register_package(__name__)

"""


pyproject_toml_template = """
[build-system]
requires = [
    # First version of setuptools to support pyproject.toml configuration
    "setuptools>=61.0.0",
]
build-backend = "setuptools.build_meta"

[project]
name = "{name}"
readme = "README.rst"
requires-python = ">=3.7"
dependencies = [
    "aim",
]
dynamic = [
  'version'
]

[tool.setuptools.package-data]
{name} = ["*.py"]
"""


def get_pkg_distribution_sources(pkg_name: str):
    import importlib_metadata
    import json
    dist = importlib_metadata.distribution(pkg_name)
    direct_url_json_path: Path = dist._path / 'direct_url.json'
    if direct_url_json_path.exists():
        with direct_url_json_path.open('r') as fh:
            direct_url_json = json.load(fh)
            is_editable = direct_url_json['dir_info']['editable']
            if is_editable:
                return direct_url_json['url'][len('file://'):]
    return None
