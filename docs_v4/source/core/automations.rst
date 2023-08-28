###########
 Automations
###########

Actions
-------
Actions are the basic building block of the Aim automation.
Actoins are defined as specific kind of records that are tracked by Aim and are capable of executing a specific task.
Typically Actions are defined to use Aim-logged data to connect different parts of the system together via a task.
For example, an Action can be defined to execute an eval workflow to a user when a certain event occurs.

Callbacks
---------
Callbacks are a way to organize when specific Action needs to execute.
Callbacks are special listeners to the Aim Storage that allows to register Actions by any kind of logic based on the data that is being logged.
For example, a Callback can be defined to execute an Action when a certain event occurs.

Beats
-----
Beats are special kind of actions that are designed to send notification on many different mediums.
Beats are a secific callback and action combination built-in to Aim. 

Two-way Connection with UI
--------------------------
Actions are just another kind of objects (with specific interface) that can be logged. 
Therefore Actions can be retrieved and displayed in the Aim UI.
This allows to create a two-way connection between the Aim UI and the Aim Automation system.

