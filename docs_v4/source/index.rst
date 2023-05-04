===============
 Welcome to Aim
===============

Aim is a framework for developing loggers for any use-case.
There are 3 main layers, where Aim provides support:

- *Logging*: log any data from anywhere.
- *Automations*: log any data from anywhere.
- *Observability*: log any data from anywhere.

The Aim framework is designed with the above principles in mind.

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
        Search
        Callbacks
        Notifications

Quick Start
---------------

Checkout the below guide for a walk-through of how to get started using Aim to create a new logger.


.. toctree::
  :maxdepth: 3
  :caption: 🏁 Getting Started
  :name: quick_start

  quick_start/getting_started.rst
  quick_start/integrations.rst
  quick_start/next_steps.rst

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

  ./core/overview.rst
  ./core/logging.rst
  ./core/search.rst
  ./core/automations.rst
  ./core/observability.rst

Use Cases
---------

Explore use-cases Aim unlocks.

.. toctree::
  :maxdepth: 1
  :caption: 💡 Use Cases
  :name: use-cases

  ./use_cases/use_case_1.rst
  ./use_cases/use_case_2.rst

Packages
---------

Aim is just a groundwork for bulding custom loggers.
Explorer Aim ecosystem (AimStack) and pick a logger for your use-case.

.. toctree::
  :maxdepth: 1
  :caption: 📦 Packages
  :name: packages

  ./packages/llm.rst
  ./packages/ai_agents.rst

Reference
---------

.. toctree::
  :maxdepth: 1
  :caption: 📚 Reference
  :name: reference

  refs/sdk.rst
  refs/ui.rst

Community
---------

Community guides

.. toctree::
  :maxdepth: 1
  :caption:  Community
  :name: community

  ./community/CHANGELOG.md
  ./community/CONTRIBUTING.md
  ./community/CODE_OF_CONDUCT.md


Browse
------

.. toctree::
  :maxdepth: 1
  :caption:  Browse
  :name: browse

  ./browse/glossary.rst
  ./browse/genindex.rst
  ./browse/modindex.rst


Resources
---------

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