Installation
############

This section shows a simple end-to-end aim setup. It starts from the installation, shows how to run Aim UI and explore the
results.
Use this as a starting point to get familiar with the basics of Aim while getting up and running.

Installing Aim
**************

Aim is a python package available for Linux and MacOs for Python versions 3.6+. Install Aim using `pip3`:

.. code-block:: console

  pip3 install aim

Verify aim was properly installed

.. code-block:: console
  aim version

You should see the line listing newly installed version of Aim. For instance:

.. code-block:: none

  Aim v3.5.1

The installed package includes Python SDK needed for tracking training runs, UI for browsing the results and CLI
for managing UI and results.

Nightly releases
================

Aim also provides daily dev packages with the features developed between main minor releases.

.. code-block:: console

  pip3 install --pre aim

Please note, that if the dependencies of ``aim`` are not already installed, this command will try to install the development versions of those packages as well.

Previous daily dev packages can be installed using the following command:

.. code-block:: console

  pip3 install aim==3.x.0.devyyyymmdd

`Release history <https://pypi.org/project/aim/#history>`_

Initializing Aim repository
***************************

Aim repository is the space where all your training runs are logged.

To initialize ``aim`` repo in the current working directory, run:

.. code-block:: console

  aim init

You should see something like this on your Command line:

.. code-block:: none

  Initialized a new Aim repository at /home/user/aim

Your workspace is now ready for tracking training runs with Aim.
