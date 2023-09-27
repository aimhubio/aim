##################
LangChain Chatbot
##################


LangChain Chatbot is a simple chatbot that responds to user queries. Logs LLM prompts/generations, tool inputs/outputs, and chain metadata.

In this example, we will demonstrate how to use the LangChain Chatbot to track all the inputs and outputs during your interaction with an LLM.

Let's import necessary libraries:

.. code-block:: python

    from langchain.agents import Tool
    from langchain.agents import AgentType
    from langchain.memory import ConversationBufferMemory
    from langchain.chat_models import ChatOpenAI
    from langchain.utilities import SerpAPIWrapper
    from langchain.agents import initialize_agent

    from aimstack.langchain_debugger.callback_handlers import GenericCallbackHandler


First let's define our serpAPI and OpenAI API key keys
.. code-block:: python
    serpapi_key="..."
    openai_key="..."


Next, let's implement a simple chatbot.

First, we will initialize a `ConversationBufferMemory`:

.. code-block:: python

    memory = ConversationBufferMemory(memory_key="chat_history")

Then, a `SerpAPIWrapper` for querying Google searches:

.. code-block:: python

    search = SerpAPIWrapper(serpapi_api_key=serpapi_key)
    tools = [
        Tool(
            name="Search",
            func=search.run,
            description="Useful for when you need to answer questions about current events or the current state of the world"
        ),
    ]

After which, let's initialize a chatbot using the `gpt-4-0613` model and initialize a conversation agent:

.. code-block:: python

    model_name = 'gpt-4-0613'

    llm = ChatOpenAI(temperature=0, openai_api_key=openai_key, model_name=model_name)

    agent_chain = initialize_agent(
        tools, llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        verbose=True,
        memory=memory,
        handle_parsing_errors="Check your output and make sure it conforms!"
    )

The last setup step is to instantiate the Aim callback `GenericCallbackHandler` and run it in an infinite loop to interact with the model. Also, pass the Aim callback instance to the chain agent so all the inputs and outputs will be tracked in the Aim storage:

.. code-block:: python

    # Init the callback
    aim_cb = GenericCallbackHandler()

    # Run the bot
    while True:
        msg = input('Message:\n')
        response = agent_chain.run(input=msg, callbacks=[aim_cb])
        aim_cb.flush()
