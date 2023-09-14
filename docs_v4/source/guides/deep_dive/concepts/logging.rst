###########
 Logging
###########

Aim is built to log vast quantities of logs from every part of the system.
There are three main concepts when logging with Aim:
- Records - a single log entry
- Sequences - a collection of records
- Containers - a set of interconnected sequences

Records
-------
Records can be any python objects. 
Records are used as a unit of the log.
Aim comes with a number of predefined records such as Number, Text, Image, Distribution etc. 

Sequences
---------
Sequences are a collection or Records.
Sequences are used to log series of Records.
Aim comes with a number of predefined sequences such as Metric, SystemMetric, TextSequence


Containers
----------
Containers are a set of interconnected sequences.
Role of the container is to help organize the logged records and sequences into coherent structure that will be queryable.
Containers also allow an elegant design of every part of the AI System - Training Run, Model Eval, Production, LLM experiment etc.
Aim comes with a number of predefined containers such as Run.