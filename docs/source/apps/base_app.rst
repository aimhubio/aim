#################
Base App
#################

About
=====
Base App provides the logging primitives and the UI for logs browsing. 

The Base App UI provides the views for all primitive types as well as views for any other custom record type that is logged with Aim.

.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/v4-images/guides/aim-logs-overview.png
    :width: 100%
    :alt: Aim Logs Overview

Installation
------------
Installed out of the box with as part of default Aim installation.
Users can unregister and replace with any other app.

Usage
=====
The Base app is default installed with Aim. It can be accessed via 

.. code-block:: python
  
  from aimstack.base import Metric, ImageSequence

Base app boards
============
Base app UI is very handy to browse through the logs and sense check them. It provides the following views:

- Overview
- Metrics
- Texts
- Images
- Figures

