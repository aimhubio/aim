#######
Storage
#######

About
=====
Aim is built around its super-performant logs storage.

The Aim storage is a schemaless storage built on top of RocksDB.
It allows to store large quantities of sequential data of any kind of records - organized through containers.

There are two main requirements at the basis of building the Aim storage:

- Ability to handle lots of consecutive, non-blocking writes
- Ability to retrieve the logs at the levels of containers, sequences and records.

Internals
=========
Aim storage is built like a one large JSON organized via Containers, Sequences and Records.
When writing to the storage, the data is serialized and saved into its respective subtree.


.. image:: https://docs-blobs.s3.us-east-2.amazonaws.com/v4-images/guides/aim-storage-diagram.png
    :alt: Aim storage diagram
    :align: center
    :width: 100%

Read/write laziness
----------------------
As the storage is built to become one giant tree of records, the read and write are optimized in a way that only the respective subtree is accessed at each time.

We call this feature laziness in read and write. It's enabled by the way the containers and sequences are processed and stored.

Record serialization
--------------------
Aim storage introduces a python-compatible serialization mechanism. 
This means that Aim serializes python objects (Records) into the storage and stores sequences of them. 

This feature is the key to the storage's ability to store any logs of Records users can specify via Python objects.

The serialization mechanism is also used when transporting the data from backend to the frontend. This allows very efficient retrieval and transport all the way to the frontend where the data gets deserialized before being rendered.

In case of sequences, this serialization also allows efficient sequences streaming - aim streams chunks of serialized sequences that can be deserialized and visualized on the other end by the client chunk-by-chunk.
This is key especially when dealing with long sequences and large blogs of data (e.g. images, audios etc.)

Query language
==============
At the lowest level, the Aim storage is equipped with a pythonic query language. This means that you can query all your sequences and containers by their properties via a pythonic if statement over them.

Security considerations
-----------------------
The query expressions are executed in a restricted python environment that's configured to have no access to the environment whatsoever. Therefore malicious queries just won't execute.
