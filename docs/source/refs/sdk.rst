===============
 Aim Python SDK
===============

API Reference for Aim Python SDK classes
========================================

Aim is designed to enable logging of any data type.
This reference will guide you through the fundamental data building blocks,
as well as data retrieval approaches.

.. currentmodule:: aim._sdk
.. automodule:: aim._sdk

Repo class reference
====================
.. currentmodule:: aim._sdk.repo
.. automodule:: aim._sdk.repo

Repository management
---------------------
.. currentmodule:: aim._sdk.repo
.. autosummary::
    :nosignatures:

    Repo.is_remote_path
    Repo.default
    Repo.from_path
    Repo.active_repo
    Repo.exists
    Repo.init
    Repo.rm
    Repo.get_version

Data access interface
---------------------
.. currentmodule:: aim._sdk.repo
.. autosummary::
    :nosignatures:

    Repo.container_hashes
    Repo.get_container
    Repo.containers
    Repo.sequences
    Repo.tracked_container_types
    Repo.tracked_sequence_types
    Repo.tracked_sequence_infos
    Repo.tracked_params
    Repo.storage_engine
    Repo.resource_tracker

Package and Types information
-----------------------------
.. currentmodule:: aim._sdk.repo
.. autosummary::
    :nosignatures:

    Repo.registered_container_types
    Repo.registered_sequence_types
    Repo.registered_actions
    Repo.add_package
    Repo.remove_package
    Repo.load_active_packages

Data management interface
-------------------------
.. currentmodule:: aim._sdk.repo
.. autosummary::
    :nosignatures:

    Repo.delete_containers
    Repo.delete_container
    Repo.move_containers
    Repo.copy_containers
    Repo.prune

.. autoclass:: Repo
    :members:
    :special-members:
    :no-undoc-members:

Container class interface
=========================
.. currentmodule:: aim._sdk.container
.. automodule:: aim._sdk.container

Container creation and retrieval
--------------------------------
.. currentmodule:: aim._sdk.container
.. autosummary::
    :nosignatures:

    Container.from_storage
    Container.filter
    Container.find
    Container.match

Params and properties management
--------------------------------
.. currentmodule:: aim._sdk.container
.. autosummary::
    :nosignatures:

    Container.__setitem__
    Container.set
    Container.__getitem__
    Container.get
    Container.__delitem__
    Container.collect_properties
    Container.creation_time
    Container.end_time

Sequence data management
------------------------
.. currentmodule:: aim._sdk.container
.. autosummary::
    :nosignatures:

    Container.delete_sequence
    Container.sequences
    ContainerSequenceMap.typed_sequence
    ContainerSequenceMap.__call__
    ContainerSequenceMap.__iter__
    ContainerSequenceMap.__getitem__
    ContainerSequenceMap.__delitem__

Container metadata and management
---------------------------------
.. currentmodule:: aim._sdk.container
.. autosummary::
    :nosignatures:

    Container.delete
    Container.close
    Container.get_logged_typename
    Container.get_typename
    Container.get_full_typename
    Container.version

.. autoclass:: aim._sdk.container.Container
    :members:
    :special-members:
    :no-undoc-members:

.. autoclass:: aim._sdk.container.ContainerSequenceMap
    :members:
    :special-members:
    :no-undoc-members:

Sequence class interface
========================

.. currentmodule:: aim._sdk.sequence
.. autosummary::
    :nosignatures:

    Sequence.track
    Sequence.filter
    Sequence.find
    Sequence.match

.. autoclass:: Sequence
    :members:
    :special-members:
    :no-undoc-members:

.. autoclass:: SequenceView
    :members:
    :special-members:
    :no-undoc-members:

aim.Record
------------

.. autoclass:: aim._sdk.record.Record
    :members:
    :special-members:
    :no-undoc-members:
