# aim
#### Version control for AI

See the docs [here](https://docs.aimhub.io).

## Development

### Requirements

* Python 3

We suggest to use [virtual
environment](https://packaging.python.org/tutorials/installing-packages/#creating-virtual-environments) for managing local dependencies.

To start development first install all dependencies:

```bash
pip install -r requirements.txt
```

### Project Structure

```
├── aim  <----------------  main project code
│   ├── cli <-------------  command line interface
│   ├── engine <----------  business logic
│   ├── sdk <-------------  Python SDK
│   ├── artifacts <-------  managing tracked data
│   └── version_control <-  managing files and code
├── examples <------------  example usages of aim SDK
└── tests
```

### Code Style
We follow [pep8](https://www.python.org/dev/peps/pep-0008/) style guide for python code. We use [autopep8](https://pypi.org/project/autopep8/) and [pycodestyle](https://pypi.org/project/pycodestyle/) to enable checking and formatting Python code. 

To check code styles, run `pycodestyle .` in the root folder. 

To auto format, run `autopep8 --in-place --recursive --aggressive --aggressive .` in the root folder.