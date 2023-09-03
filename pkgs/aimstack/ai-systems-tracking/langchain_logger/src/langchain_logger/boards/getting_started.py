ui.header("🦜🔗 LangChain")

ui.text(
    "LangChain is a powerful library designed to empower developers in creating applications that seamlessly combine large language models like GPT-3 with other sources of computation or knowledge. This allows you to perform tasks such as question answering over specific documents, build chatbots, and create intelligent agents."
)

ui.text(
    "For more details, please visit the LangChain GitHub repository: LangChain GitHub: https://github.com/langchain-ai/langchain"
)

ui.subheader("Installation")

ui.text(
    "To get started, install the LangChain package. Navigate to `/pkgs/aimstack/ai-systems-tracking/langchain_logger` and execute the following command:"
)
ui.code("pip install .")

ui.text(
    "This will install the `langchain_logger` module and make the callback handler and all its contents readily available for your experiments."
)

ui.subheader("Setup")

ui.text(
    "Before diving into LangChain, ensure you have the necessary credentials set up. You'll need an OpenAI API key for large language models (LLMs) and a SERP API key for relevant tools."
)

ui.text("Let's set these keys as environment variables within your Python script:")
ui.code(
    """
import os
    
os.environ['OPENAI_API_KEY'] = 'your_openai_api_key'
os.environ['SERPAPI_API_KEY'] = 'your_serp_api_key'
"""
)

ui.subheader("Examples")

ui.text(
    "Now, let's explore the two primary components of LangChain: the `LLMChain` and `AgentChain`."
)

ui.text(
    "We'll begin by harnessing the power of the `AgentChain` to enhance the capabilities of large language models (LLMs) with various tools."
)

ui.subheader("Building Chatbots using LLMChain")

ui.text("First, initialize an LLM, which we'll utilize in the following example.")

ui.code(
    """
from langchain.chat_models import ChatOpenAI


llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    temperature=0,
)
"""
)

ui.text(
    "Next, let's create a template that allows for the injection of multiple prompts."
)

ui.code(
    """
from langchain.prompts import PromptTemplate


template = 'You are a playwright. Given the title of a play, it is your job to write a synopsis for that title. Title: {title} Playwright: This is a synopsis for the above play:'
prompt_template = PromptTemplate(input_variables=['title'], template=template)

test_prompts = [
    {'title': 'documentary about good video games that push the boundary of game design'},
    {'title': 'the phenomenon behind the remarkable speed of cheetahs'},
    {'title': 'the best-in-class MLOps tooling'},
]
"""
)

ui.text(
    "Now, instantiate our Aim callback handler. Provide the current user name, specify whether you are in development mode or not, set the prompt template to be logged in your experiment, and define the LLM being utilized."
)

ui.code(
    """
from langchain_logger.logging.callback_handler import AimCallbackHandler


aim_cb = AimCallbackHandler(
    username=get_user(),
    dev_mode=True,
    prompt_template=prompt_template,
    llm=llm,
)
"""
)

ui.text(
    "Finally, let's initialize an LLM Chain. Include the Aim callback instance in the list of callbacks, and apply the prompt template to the LLM chain."
)

ui.code(
    """
from langchain.chains import LLMChain

synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callbacks=[aim_cb])
synopsis_chain.apply(test_prompts)
"""
)


ui.subheader("Enhancing LLMChain with AgentChain")

ui.text("Let's begin by defining the set of tools we'll use.")
ui.text(
    "Importing SerpAPIWrapper for running search queries on the web and the Tool to manage the later."
)

ui.code(
    """
from langchain.utilities import SerpAPIWrapper
from langchain.agents import Tool


search = SerpAPIWrapper()
tools = [
    Tool(
        name="Search",
        func=search.run,
        description="Useful for answering questions about current events or the current state of the world.",
    ),
]
"""
)

ui.text(
    "Additionally, we can instantiate a memory buffer instance to keep track of our conversation history in various formats."
)

ui.code(
    """
from langchain.agents.memory import ConversationBufferMemory
    

memory = ConversationBufferMemory(memory_key="chat_history")
"""
)

ui.text(
    "Now, let's initialize our Agent Chain using `initialize_agent`. We'll incorporate the previously defined tools."
)

ui.code(
    """
from langchain.agents import AgentType, initialize_agent


agent_chain = initialize_agent(
    tools,
    llm,
    agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
    handle_parsing_errors="Check your output and ensure it conforms!",
)
"""
)

ui.text("Initializing the Aim Callback with objects specific to this example.")

ui.code(
    """
aim_cb = AimCallbackHandler(
    username=get_user(),
    dev_mode=True,
    memory=memory,
    tools=tools,
    llm=llm,
)
"""
)

ui.text(
    "Finally, let's enter into an endless loop to ask questions and get responses from the Agent Chain as many times as needed."
)

ui.code(
    """
while True:
    msg = input('Message:\\n')
    response = agent_chain.run(input=msg, callbacks=[aim_cb])
"""
)
