# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
import os
import sys
import glob
from importlib.util import module_from_spec, spec_from_file_location


sys.path.insert(0, os.path.abspath('..'))


PATH_HERE = os.path.abspath(os.path.dirname(__file__))
PATH_ROOT = os.path.join(PATH_HERE, '..', '..')

spec = spec_from_file_location(
    'aim/__about__.py', os.path.join(PATH_ROOT, 'aim', '__about__.py')
)
about = module_from_spec(spec)
spec.loader.exec_module(about)

# -- Project information -----------------------------------------------------

project = 'Aim'
copyright = about.__copyright__
author = about.__author__

# The full version, including alpha/beta/rc tags
release = about.__version__

# -- Project documents -------------------------------------------------------

def _transform_changelog(path_in: str, path_out: str) -> None:
    with open(path_in) as fp:
        chlog_lines = fp.readlines()
    # enrich short subsub-titles to be unique
    chlog_ver = ""
    for i, ln in enumerate(chlog_lines):
        if ln.startswith('## '):
            chlog_ver = ln[2:].split('-')[0].strip()
        elif ln.startswith('### '):
            ln = ln.replace('###', f'### {chlog_ver} -')
            chlog_lines[i] = ln
    with open(path_out, 'w') as fp:
        fp.writelines(chlog_lines)


COMMUNITY_PATH = os.path.join(PATH_HERE, 'community')
os.makedirs(COMMUNITY_PATH, exist_ok=True)

# Copy the contributing guide, changelog and code of conduct
community_docs = (
    'CHANGELOG.md',
    'CODE_OF_CONDUCT.md',
    'CONTRIBUTING.md',
)
for community_doc in community_docs:
    _transform_changelog(os.path.join(PATH_ROOT, community_doc),
                         os.path.join(COMMUNITY_PATH, community_doc))

# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx.ext.napoleon',
    'sphinx_copybutton',
    'sphinxcontrib.mermaid',
    'm2r2'
]

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = []

pygments_style = 'sphinx'

# -- Options for HTML output -------------------------------------------------

# The theme to use for HTML and HTML Help pages.  See the documentation for
# a list of builtin themes.
#
html_theme = 'furo'

html_theme_options = {
    "source_repository": "https://github.com/aimhubio/aim/",
    "source_branch": "main",
    "source_directory": "docs/",
}

templates_path = ['_templates']

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = ['_static']
# html_logo = "_static/images/logo.svg"
html_favicon = '_static/images/logo.svg'

autodoc_typehints = 'none'
autodoc_member_order = 'groupwise'

source_suffix = ['.rst', '.md']

with open("rst_prolog.rst", "r") as prolog_file:
    rst_prolog = prolog_file.read()
