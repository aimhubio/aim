###########
 Observability
###########

Aim allows to build a whole observability layer for the AI systems.
These are the main building blocks for the AI Observability layer:

UI Components
-------------

Aim comes with a wide array of UI components bound to its pythonic UI interface.
These components range from search to tables and select boxes.
All seemlessly bound to the logged Aim data.

Boards
------

The Aim Boards are the fundamental building unit of any kind of aim-based observability layer.
They are the main UI component that allows to visualize the logged data.
Boards are composed of UI components and data retrieval.

Page Boards
-----------
Every Board can be a page Board.
Page Boards are the composite boards that constitute a UI page.
Please note that not every board however is a page.

Template Boards
---------------
Unlike page boards, template boards are not meant to be used as a page.
Template boards are meant to be used as a template for other boards.
These can be fed with data and be used along with other boards to build a page.
