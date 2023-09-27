==============
 UI Components
==============

Aim makes it easy to display and visualize almost any logged data.
The API reference is divided into sections by the data type you want to visualize.

Explore the components and its interface to learn more on how to build awesome observability apps with Aim.

Sections:

- :ref:`Text<text>`
- :ref:`Data display<data-display>`
- :ref:`Charts<charts>`
- :ref:`Media<media>`
- :ref:`Inputs<inputs>`
- :ref:`Layouts<layouts>`
- :ref:`Explorers<explorers>`

.. toctree::
  :maxdepth: 2
  :hidden:

  ./ui/text.rst

.. _text:

Text
====

Simple text
------------

.. code-block:: python

   ui.text("text")

Displays simple text.

`Learn more <./ui/text.html>`_

Headers
-------

.. code-block:: python

   ui.header()
   ui.subheader()

Headers like in markdown - large and medium.

Titles
------

.. code-block:: python

   ui.title()
   ui.subtitle()

Page title and subtitle.

.. _data-display:

Data display
============

Table
-----

.. code-block:: python

   ui.table()

Basic table visualization.

JSON
----

.. code-block:: python

   ui.json()

JSON visualization.

.. _charts:

Charts
======

Plotly
------

.. code-block:: python

   ui.plotly()

Plotly visualization.

.. _media:

Media
=====

Media

.. _inputs:

Inputs
======

Inputs

.. _layouts:

Layouts
=======

Layouts

.. _explorers:

Explorers
=========

Explorers