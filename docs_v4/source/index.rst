===============
 Welcome to Aim
===============

Aim is a modular framework for building AI Systems logging and visualization tools.

You can use Aim to build the whole observability layer of your AI System.
Aim provides a flexible and powerful way to log, explore, and visualize any type of data.

With Aim you will:
- Fully own your data
- Avoid vendor lock-in
- Be able to build day 2 complex observability use-cases.

Aim is built around three main aspects, each focusing on different pillar of the
logging and logs analysis process:

- **Logging**: Log any type of data from any source.
- **Observability**: Create your own UI pages, via Aim boards, explorers, and reports.
- **Automations**: Automate processes, actions, and set up alerts on anything you have logged.

Together, they form the foundation of the Aim framework, providing a powerful and flexible way
for building any kind of logging and visualization tool.


.. mermaid::

  mindmap
    root((Aim))
      Observability
        Explorers
        Boards
        Reports
      Logging
        Objects
        Sequences
        Collections
      Automations
        Callbacks
        Notifications
        Monitoring

Getting Started with Aim
------------------------

It's easy to get started with Aim. Follow the quick start guide below to install and use your first Aim package.

.. toctree::
  :maxdepth: 3
  :caption: 🏁 Getting Started
  :name: getting_started

  getting_started/quick_start.rst
  getting_started/integrations.rst
  getting_started/next_steps.rst

Core Concepts
-------------

There are 3 main layers that Aim provides support for.
For each layer we provide some examples to get started, how-to guides, reference docs, and conceptual guides.

.. mermaid::

  flowchart BT
    Automations --> Observability
    Logging <--> Automations
      Logging <--> Observability

.. toctree::
  :maxdepth: 4
  :caption: ⚡ Core Concepts
  :name: core

  ./core/core.rst
  
Use Cases
---------

Explore the various use cases that Aim enables, and see in action how it enhances
your data tracking and visualization processes.

.. toctree::
  :maxdepth: 1
  :caption: 💡 Use Cases
  :name: use-cases

  ./use_cases/use_case_1.rst

Packages
---------

Aim serves as a foundation for building custom loggers.
Discover the Aim ecosystem – AimStack, and choose a logger tailored to your specific use case.

.. toctree::
  :maxdepth: 1
  :caption: 📦 Packages
  :name: packages

  ./packages/experiment_tracking.rst

Reference
---------

All of Aim’s reference documentation, in one place.

.. toctree::
  :maxdepth: 1
  :caption: 📚 Reference
  :name: reference

  refs/sdk.rst
  refs/ui.rst

Community
---------

Become a part of the Aim community.

.. toctree::
  :maxdepth: 1
  :caption: 👐 Community
  :name: community

  ./community/CHANGELOG.md
  ./community/CONTRIBUTING.md
  ./community/CODE_OF_CONDUCT.md


Browse
------

Explore the content directory to quickly find specific topics, terms,
and concepts within the documentation.

.. toctree::
  :maxdepth: 1
  :caption: 🗂️ Browse
  :name: browse

  ./browse/glossary.rst
  ./browse/genindex.rst
  ./browse/modindex.rst


Resources
---------

Discover Aim resources, including the official repositories, community channels, and more.

.. toctree::
  :maxdepth: 1
  :caption: 🔗 Resources
  :name: resources

  Aim repo <https://github.com/aimhubio/aim>
  AimStack repo <https://github.com/aimhubio/aimstack>
  Discord <https://community.aimstack.io>
  Twitter <https://twitter.com/aimstackio>
  Blog <https://aimstack.io/blog>
  Website <https://aimstack.io>


TODO
community/telemetry.md
