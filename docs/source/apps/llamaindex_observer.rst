###################
LlamaIndex Observer
###################

LlamaIndex is a query engine tailored to answer questions over your data.

LlamaIndex Observer package will log events during LlamaIndex executions, such as LLMs inputs and outputs, templating context and variables, etc.

Import the Aim LlamaIndex callback handler:

.. code-block:: python

   from aimstack.llamaindex_observer.callback_handlers import GenericCallbackHandler


Initialize the Aim Callback handler

.. code-block:: python

    aim_cb = GenericCallbackHandler(repo='aim://0.0.0.0')
    callback_manager = CallbackManager([aim_cb])


Create a service context

.. code-block:: python

    service_context = ServiceContext.from_defaults(callback_manager=callback_manager)


Next, set the service context to log LlamaIndex executions.

.. code-block:: python

    # example
    index = load_index_from_storage(storage_context, service_context=service_context)

Run callback flush command after each step:

.. code-block:: python

    # e.g. after each query response
    query_engine = index.as_query_engine()

    result = query_engine.query(
        "How does Graham address the topic of competition and the importance (or lack thereof) of being the first mover in a market?"
    )
    aim_cb.flush()
