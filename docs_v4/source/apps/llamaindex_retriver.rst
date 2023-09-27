###################
LlamaIndex Retriver
###################

LlamaIndex Retriver is a query engine tailored to answer questions over your data.

In this example, we will demonstrate how to use Aim-powered LlamaIndex Retriever to query an LLM.
Running LlamaIndex Retriever is a breeze. LlamaIndex Retriever will keep track of LlamaIndex embeddings, LLMs, Templating, Query, and many more in Aim.


Lets' import necessary libraries:

.. code-block:: python

    import os

    from llama_index import StorageContext, load_index_from_storage, set_global_handler, ServiceContext
    from llama_index.callbacks import CallbackManager

    from aimstack.llamaindex_observer.callback_handlers import GenericCallbackHandler

Set your OpenAI API key:

.. code-block:: python
    os.environ["OPENAI_API_KEY"] = ""


Rebuilding the storage context

.. code-block:: python
    storage_context = StorageContext.from_defaults(persist_dir="index")


Initialize the Aim Callback handler

.. code-block:: python
    aim_cb = GenericCallbackHandler(repo='aim://0.0.0.0:8271')
    callback_manager = CallbackManager([aim_cb])

Create a service context

.. code-block:: python
    service_context = ServiceContext.from_defaults(callback_manager=callback_manager)


Next, load the index from storage and query the query engine, and see the response output which is also stored in Aim. We can simply print it.

# Load the index
.. code-block:: python
    # load index
    index = load_index_from_storage(storage_context, service_context=service_context)

    query_engine = index.as_query_engine()

    result = query_engine.query(
        "How does Graham address the topic of competition and the importance (or lack thereof) of being the first mover in a market?"
    )
    aim_cb.flush()

    print(result)