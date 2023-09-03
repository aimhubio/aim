ui.header("OpenAI API")

ui.text(
    "The OpenAI API is an interface that allows developers to access OpenAI's natural language processing capabilities, and the OpenAI Python library simplifies interaction with this API in Python applications by providing pre-defined classes and compatibility with various API versions."
)

ui.text(
    "For more details, please visit the OpenAI API GitHub repository: OpenAI Python Library GitHub: https://github.com/openai/openai-python"
)

ui.subheader("Installation")

ui.text(
    "To get started, install the OpenAI API package. Navigate to `/pkgs/aimstack/ai-systems-tracking/openai_logger` and execute the following command:"
)
ui.code("pip install .")

ui.text(
    "This will install the `openai_logger` module and make the callback handler and all its contents readily available for your experiments."
)

ui.subheader("Setup")

ui.text(
    "Before diving into OpenAI API, ensure you have the necessary credentials set up. You'll need an OpenAI API key for large language models (LLMs)."
)

ui.text("Let's set these keys as environment variables within your Python script:")
ui.code(
    """
import os
    
os.environ['OPENAI_API_KEY'] = 'your_openai_api_key'
"""
)

ui.subheader("Examples")

ui.text(
    "Let's embark on an exploration, delving into an illustrative example that showcases the remarkable capabilities of the OpenAI API. We will initiate a conversation with the system or request the Language Model (LLM) to seamlessly extend an ongoing dialogue."
)

ui.subheader("Chat Completion using OpenAI")

ui.text(
    "To begin, we will initiate our Aim callback handler, which will monitor the conversation, the number of input and output tokens, and and many more. Supply your current username, indicate your development mode preference and provide the model name."
)

ui.code(
    """
from openai_logger.logging.callback_handler import AimCallbackHandler
from llamaindex_logger.utils import get_user

model="gpt-3.5-turbo"
aim_callback = AimCallbackHandler(username=get_user(), dev_mode=True, model=model)
"""
)

ui.text(
    "Now, we'll create a ChatCompletion instance. Just provide the callback manager, tell us which language model you want to use, and provide the initial chat question."
)
ui.text(
    "Just a quick heads-up! The ChatCompletion we're using here comes from our codebase, not the one in the openai package. Our openai_logger.ChatCompletion is a friendly wrapper around the openai.ChatCompletion. We've added this wrapper to keep a close eye on all the important information because the latter doesn't have a built-in callback mechanism."
)

ui.code(
    """
from openai_logger import ChatCompletion

chat_completion = ChatCompletion.create(
    aim_callback, model=model, messages=[{"role": "user", "content": "Hello, at what temperature does the ice melt?"}]
)
"""
)
