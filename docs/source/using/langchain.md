# LangChain

LangChain is a platform that aims to assist developers in creating powerful applications by combining large language models (LLMs) with other sources of computation or knowledge. While LLMs are transformative technology that enable developers to build applications they previously could not, LangChain recognizes that using LLMs in isolation may not be enough to create truly powerful apps.

LangChain is a promising tool that can help accelerate the development of advanced natural language processing applications in various domains, such as conversational agents, chatbots, sentiment analysis, and language translation.

With the Text Explorer feature, it is possible to compare multiple executions of LangChain runs side by side, providing a comprehensive and visually appealing comparison:

![](https://user-images.githubusercontent.com/13848158/227784994-699b24b7-e69b-48f9-9ffa-e6a6142fd719.png)


LangChain is a powerful framework designed to facilitate the development of language model-driven applications. To [learn more](https://github.com/hwchase17/langchain) about LangChain, head over to our GitHub page, or check out the official [documentation](https://python.langchain.com/en/latest/index.html).


## Tracking LangChain Executions

Let's move forward and see how to enable and configure the callback. We will explore three use-cases.
To start off, we will install the necessary packages and import certain modules.


```bash
!pip install aim
!pip install langchain
!pip install openai
!pip install google-search-results
```

Subsequently, we will configure two environment variables that can be established either within the Python script or through the terminal.

```bash
import os
from datetime import datetime

from langchain.llms import OpenAI
from langchain.callbacks.base import CallbackManager
from langchain.callbacks import AimCallbackHandler, StdOutCallbackHandler
```

Our examples use a GPT model as the LLM, and OpenAI offers an API for this purpose. You can obtain the key from the following link: https://platform.openai.com/account/api-keys .

We will use the SerpApi to retrieve search results from Google. To acquire the SerpApi key, please go to https://serpapi.com/manage-api-key .


```python
os.environ["OPENAI_API_KEY"] = "..."
os.environ["SERPAPI_API_KEY"] = "..."
```


The event methods of `AimCallbackHandler` accept the LangChain module or agent as input and log at least the prompts and generated results, as well as the serialized version of the LangChain module, to the designated Aim run.


```python
session_group = datetime.now().strftime("%m.%d.%Y_%H.%M.%S")
aim_callback = AimCallbackHandler(
    repo=".",
    experiment_name="scenario 1: OpenAI LLM",
)

manager = CallbackManager([StdOutCallbackHandler(), aim_callback])
llm = OpenAI(temperature=0, callback_manager=manager, verbose=True)
```

The `flush_tracker` function is used to record LangChain assets. By default, the session is reset rather than being terminated outright.


<h3>Scenario 1</h3> In the first scenario, we will use OpenAI LLM.

# scenario 1 - LLM
llm_result = llm.generate(["Tell me a joke", "Tell me a poem"] * 3)
aim_callback.flush_tracker(
    langchain_asset=llm,
    experiment_name="scenario 2: Chain with multiple SubChains on multiple generations",
)

<h3>Scenario 2</h3> Scenario two involves chaining with multiple SubChains across multiple generations.

```python
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
```

```python
# scenario 2 - Chain
template = """You are a playwright. Given the title of play, it is your job to write a synopsis for that title.
Title: {title}
Playwright: This is a synopsis for the above play:"""
prompt_template = PromptTemplate(input_variables=["title"], template=template)
synopsis_chain = LLMChain(llm=llm, prompt=prompt_template, callback_manager=manager)

test_prompts = [
    {"title": "documentary about good video games that push the boundary of game design"},
    {"title": "the phenomenon behind the remarkable speed of cheetahs"},
    {"title": "the best in class mlops tooling"},
]
synopsis_chain.apply(test_prompts)
aim_callback.flush_tracker(
    langchain_asset=synopsis_chain, experiment_name="scenario 3: Agent with Tools"
)
```


<h3>Scenario 3</h3> The third scenario involves an agent with tools.

```python
from langchain.agents import initialize_agent, load_tools
```

```python
# scenario 3 - Agent with Tools
tools = load_tools(["serpapi", "llm-math"], llm=llm, callback_manager=manager)
agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    callback_manager=manager,
    verbose=True,
)
agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?"
)
aim_callback.flush_tracker(langchain_asset=agent, reset=False, finish=True)
```

