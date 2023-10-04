#############
How Aim works
#############

Overview
========
Aim has three main layers - Storage, SDK and core with the components of cli, logging server and web ui.
All of these together enable Aim to log large quantities of data and view them through apps and explorers.

.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/v4-images/guides/aim-structure.png
    :width: 80%
    :align: center
    :alt: Aim structure
 
Using Aim
==============
The main usage of Aim is through its logging apps - default or user-built.
The logging apps either contain the type of data to be logged or you can just use the primitive types.

Once you have installed Aim and the apps you need, here are the steps to make

- Integrate Aim logger to your code
- Start Aim server (if not already running)
- Start Aim UI
- Run your code
- Go to Aim UI and you will see the data logged.

.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/v4-images/guides/aim-logs-overview.png
    :width: 100%
    :align: center
    :alt: Aim logs overview

Behind the scenes
=================

Server
----------
When logging with Aim, all the logs are sent to the Aim Server which is responsible to storing the logs in the storage.
Aim Server uses Aim SDK as well as Aim Storage to do its job.

SDK
-------
The Aim SDK provides the main API and abstractions for Aim. Aim SDK also contains the components that enable the apps.
SDK is the library that gets installed when you install Aim. It is used across the board by all the rest of the Aim components.

Aim SDK is responsible for connecting with the Aim Storage as well as the main Aim abstractions everything else is built on.

CLI
---
The Aim CLI is a command line interface to managing Aim. It is used to start the Aim Server, Aim UI and manipulate with other Aim components. 
Aim CLI is one of the primary Aim components.

After logging
-------------
Once the data is logged, it is available to be queried via SDK or observed via Aim UI.
The Web Server is responsible for serving the serialized logged data to the UI.
Web Server is started when the `aim ui` CLI command is invoked.

Web UI
------
Aim web UI is where the apps are displayed and the data is visualized.
It has three main features

- Apps
- Explorers 
- Reports

All of these apps use the logged data through the Aim UI SDK or through explorers.

Aim UI SDK
----------
Aim UI SDK is a pythonic interface that allows to query the logged data and use it in the Aim UI as part of the apps via wide variety of visualization components.

.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/v4-images/guides/aim-apps-edit-mode.png
    :width: 100%
    :align: center
    :alt: Aim apps edit mode