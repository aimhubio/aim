ui.header("LlamaIndex 🦙")

ui.text(
    "LlamaIndex is a comprehensive platform that empowers your LLM applications by offering essential tools for data ingestion, indexing, and a versatile query interface, enabling seamless integration of various data sources and formats into your large language model application."
)

ui.text(
    "For more details, please visit the LlamaIndex GitHub repository: Llamaindex GitHub: https://github.com/jerryjliu/llama_index"
)

ui.subheader("Installation")

ui.text(
    "To get started, install the LlamaIndex package. Navigate to `/pkgs/aimstack/ai-systems-tracking/llamaindex_logger` and execute the following command:"
)
ui.code("pip install .")

ui.text(
    "This will install the `llamaindex_logger` module and make the callback handler and all its contents readily available for your experiments."
)

ui.subheader("Setup")

ui.text(
    "Before diving into llamaindex, ensure you have the necessary credentials set up. You'll need an OpenAI API key for large language models (LLMs) and a SERP API key for relevant tools."
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
    "Let's now explore an example where we will harness LlamaIndex's capability to extract information from a data source (in this case, a .txt file) and provide answers to specific questions."
)

ui.subheader("Responding to Queries from a Specified Document with LlamaIndex")

ui.text(
    "To begin, we'll initiate the process by reading all available document files from a directory using the SimpleDirectoryReader:"
)

ui.code(
    """
from llama_index import SimpleDirectoryReader


docs = SimpleDirectoryReader(
    "./data/paul_graham"
).load_data()
"""
)

ui.text(
    "Source of the dataset can be found here: https://github.com/jerryjliu/llama_index/tree/main/examples/paul_graham_essay/data"
)

ui.text(
    "Next, initialize our Aim callback handler. Supply your current username, indicate your development mode preference, and specify the documents to be used for this experiment."
)
ui.text(
    "Following this, we'll incorporate our Aim callback into the list of available callbacks within the Callbackmanager."
)

ui.code(
    """
from llamaindex_logger.logging.callback_handler import AimCallbackHandler
from llama_index.callbacks import CallbackManager

aim_callback = AimCallbackHandler(username=get_user(), dev_mode=True, docs=docs)
callback_manager = CallbackManager([aim_callback])
"""
)

ui.text(
    "Next, let's establish a ServiceContext by providing our callback manager, initialize a GPT List Indexer, and, lastly, define the query engine responsible for handling questions."
)

ui.code(
    """
from llama_index import GPTListIndex, ServiceContext

service_context = ServiceContext.from_defaults(callback_manager=callback_manager)
index = GPTListIndex.from_documents(docs, service_context=service_context)
query_engine = index.as_query_engine()
"""
)

ui.text(
    "With these steps completed, we are poised to query the engine by posing questions related to the provided document source, for instance:"
)

ui.code(
    """
response = query_engine.query("What did the author do growing up?")
"""
)
