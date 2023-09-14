########
Overview
########

What are Aim apps?
==================
As part of building software and products we use lots of logging applications such as grafana, kibana, tensorboard etc.
Each one of these are logging applications - they enable a mechanism to log data, observe it and possibly automate around it.

Aim is an operating system for logs. Aim logging apps are python packages run by Aim that enable logging, observing and automating around the logs.

[TODO] add aim apps schema image

Why do they matter?
===================
Logging apps are the backbone of the software development process. 
They enable us to understand what is going on in our software and how it behaves.

There are default apps that are already available in Aim as well as Aim provides an API for users to develop those apps.

Install an Aim app
==================
Installing an Aim app is very similar to installing any other python package.
You can install an Aim app using pip:

.. code-block:: console

  pip install aim-app-package

Once the app is installed, you can register it with Aim and just run Aim:

.. code-block:: console

  aim register aim-app-package
  aim server
  aim ui

You can register as many apps as you'd need, just provide them as a comma=separated list.

How to create an Aim app
++++====================

Follow the guide for creating an Aim app here.