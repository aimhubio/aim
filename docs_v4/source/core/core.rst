###########
 Core
###########

Overview
--------

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

Core Concepts
-------------

There are 3 main layers that Aim provides support for.
For each layer we provide some examples to get started, how-to guides, reference docs, and conceptual guides.

.. mermaid::

  flowchart BT
    Automations --> Observability
    Logging <--> Automations
      Logging <--> Observability