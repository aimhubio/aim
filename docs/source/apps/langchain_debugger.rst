##################
LangChain Debugger
##################

LangChain enables building applications with LLMs through composability.

LangChain Debugger is an Aim app that enables to tracks LangChain executions, including:

- prompts and generations of LLMs
- inputs and outputs of tools
- chains metadata

Set up LangChain Debugger with a few simple steps.

Import the callback handler:

.. code-block:: python

    from aimstack.langchain_debugger.callback_handlers import GenericCallbackHandler

Initialize the callback `GenericCallbackHandler` and pass it to the chain agent:

.. code-block:: python

    # Init the callback
    aim_cb = GenericCallbackHandler()

    response = agent_chain.run(input=msg, callbacks=[aim_cb])

    aim_cb.flush()

Run callback flush command after each execution step.
