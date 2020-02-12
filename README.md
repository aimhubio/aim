# aim

Version control and collaboration for AI.

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


├── aim  <----------------  main project code
│   ├── cli <-------------  command line interface
│   ├── engine <----------  business logic for interracting with Aim Hub
│   ├── profiler <--------  experimental profiler for ML models
│   ├── sdk <-------------  Python SDK
│   └── version_control <-  managing files and tracked data
├── docs <----------------  development documentation
├── examples <------------  example usages of aim SDK
└── tests
