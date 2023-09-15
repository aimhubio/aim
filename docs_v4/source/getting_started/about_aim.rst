#############
About Aim
#############

A high-level overview on how Aim works and what are the benefits of using Aim.

How Aim works
=============

One of the principles of building Aim is: simple first, then poweful.
For the first time users, Aim is a simple easy-to-use logger that's fully equipped to handle the most immediate experiment tracking, ai systems tracing needs.
It's also well integrated with the most popular ML and LLM frameworks.

Aim is a python library that comes with a powerful storage implementation that can handle large quantities of interconnected logs.
The storage allows to query the logs at scale through its pythonic query language.
On top of the storage Aim has a groundwork that connects the data to the UI and enables the python SDK and the UI SDK.

Users interfere with Aim mainly via its python SDK.
UI SDK, which is also pythonic, allows to build low-code UI interfaces on top of logs for better observability.

The storage, the groundwork and the SDKs together are the Operating System for logs.
Aim enables building and running any type of logging apps. 
Apps can have UI (e.g. experiment tracking) or just be at a loggin level without any UI.

The end users only interfere with the UI and SDK without much care if Aim is operating system or just another point solution.

Value Prop
==========

Aim enables a powerful way to build, reuse and combine logging apps across thw whole AI System with the potential of full customizability.

- No vendor lock-in
- Fully open-source
- Users own their logs
- Users own what they want to see on Aim
- From a point solution to full observability with the same API
- Aim grows with the user's needs and the infrastructure