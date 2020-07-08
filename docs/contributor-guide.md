# Aim Architecture & How to Contribute

## Components and Architecture

<img src="https://user-images.githubusercontent.com/3179216/86799150-a7b28f00-c082-11ea-8bde-abed93cc0973.png">


### Requirements

* Python >= 3.5.0

We suggest to use [virtual
environment](https://packaging.python.org/tutorials/installing-packages/#creating-virtual-environments) for managing local dependencies.

To start development first install all dependencies:

```bash
pip install -r requirements.txt
```

## Project Structure

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

## Running the tests

Run tests via command `python -m unittest discover -s tests` in the root folder.

### Code Style
We follow [pep8](https://www.python.org/dev/peps/pep-0008/) style guide
for python code. We use [autopep8](https://pypi.org/project/autopep8/)
and [pycodestyle](https://pypi.org/project/pycodestyle/) to enable checking
and formatting Python code.

To check code styles, run `pycodestyle .` in the root folder.

To auto format, run
`autopep8 --in-place --recursive --aggressive --aggressive .` in the root folder.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our
code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available,
see the [tags on this repository](https://github.com/aimhubio/aim/tags).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
