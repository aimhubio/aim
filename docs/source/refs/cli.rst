===========
 Aim CLI
===========

Aim provides command-line interface for launching Aim UI and tracking servers,
managing Aim repositories, logged data and Aim apps.

.. currentmodule:: aimcore.cli
.. automodule:: aimcore.cli

=========== ===========
Command     Description
=========== ===========
init        Initializes or re-initializes an Aim repository at a given directory.
server      Starts the Aim remote tracking server for real-time logging.
ui          Launches the Aim web-based UI for interactive data exploration.
packages    Command group for managing Aim packages/apps.
apps        Command group for managing Aim packages/apps. Alias for **aim packages**
containers  Command group for managing containers within an Aim repository.
migrate     Migrates the data format of a specified Aim repository.
version     Prints version of installed Aim and exists.
=========== ===========

.. click:: aimcore.cli.cli:cli_entry_point
  :prog: aim
  :nested: full
