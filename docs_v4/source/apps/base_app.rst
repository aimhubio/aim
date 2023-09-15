#################
Base App
#################

About
=====
Base App is composed of logging primitives. It also provides a UI for logs browsing. 

UI provides overview for any type of Aim logs.

Usage
=====
The Base app is default installed with Aim. It can be accessed via 

.. code-block:: python
  
  from aimstack.base import Metric, ImageSequence

Logs Browser
============
Base app logs browser is a handy tool to confirm Aim logs are being written and accessible.

Overview page
-------------
The Overview page shows the bigger image of what has been logged. It is a good place to start
when you are not sure what to look for.

*[TODO: add image]*

Logs page
---------
Regardless of what you have logged - custom types or AimStack primitives, Specific logs page will provide the minimal view of all the logged data.
This is very useful when you are in development process and trying to identify which loggers make more sense or you just want to observe specific logs.

*[TODO: add image]*