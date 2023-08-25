from copy import deepcopy
from typing import Any, Dict, List

from aim import Repo
from aimstack.asp import Metric
from langchain.callbacks.base import BaseCallbackHandler
from langchain.schema import AgentAction, AgentFinish, LLMResult

from langchain_logger import (
    Message,
    MessagesSequence,
    SessionDev,
    SessionProd,
    UserActions,
    UserActivity,
)

from langchain_logger.utils import get_version
from langchain_logger import Experiment, Release
import time

"""
There are three main building blocks in Aim logging:
- Objects: a unit of data being saved. Ex. Number, Image, Text etc.
- Sequences: a sequences of objects.
- Containers: a set of interconnected sequences of objects

These constructs enable a unique way of modeling all the relationships in the software being tracked.
Below is an example of how such objects can be tracked and saved for LangChain.

"""


class AimCallbackHandler(BaseCallbackHandler):
    def __init__(
        self,
        username,
        dev_mode,
        experiment=None,
        repo_path="aim://0.0.0.0:53800",
        **extras: Any,
    ) -> None:
        """Initialize callback handler."""

        super().__init__()

        self.repo = Repo.from_path(repo_path)
        self.session = None
        self.user_activity = None
        self.user_actions = None
        self.username = username
        self.dev_mode = dev_mode
        self.experiment = experiment
        self.extras = extras

        self.tokens_usage_metric = None
        self.tokens_usage_input = None
        self.tokens_usage_output = None
        self.tokens_usage = None
        self.used_tools = set()

        self.start_inp = None
        self.end_out = None
        self.agent_actions = []

        self.setup()

    def setup(self, **kwargs: Any) -> None:
        if self.session is not None:
            return

        version = get_version()

        try:
            release = self.repo.containers(f'c.version == "{version}"', Release).first()
        except:
            release = Release(repo=self.repo)
            release[...] = {
                "version": version,
                "time": time.time(),
            }

        if self.dev_mode:
            self.experiment = Experiment(repo=self.repo)
            self.experiment["release"] = release.hash
            self.experiment["version"] = version
            self.experiment["started"] = time.time()

        if self.experiment is not None:
            for key, value in self.extras.items():
                if isinstance(value, list):
                    self.experiment[key] = [item.__dict__ for item in value]
                else:
                    self.experiment[key] = value.__dict__

        if self.dev_mode:
            self.session = SessionDev(repo=self.repo)
        else:
            self.session = SessionProd(repo=self.repo)

        model_name = ""
        if self.extras.get("llm"):
            model_name = self.extras.get("llm").model_name

        self.session[...] = {
            "chatbot_version": version,
            "model": model_name,
            "username": self.username,
            "started": time.time(),
            "experiment": self.experiment.hash if self.experiment else None,
            "release": release.hash,
        }

        # System metrics will be tracked by default.
        # TODO - getting an error on this
        # self.session.enable_system_monitoring()

        # Define what needs to be tracked as a result of LangChain execution
        self.messages = MessagesSequence(self.session, name="messages", context={})

        self.tokens_usage_input = Metric(
            self.session, name="token-usage-input", context={}
        )

        self.tokens_usage_output = Metric(
            self.session, name="token-usage-output", context={}
        )

        self.tokens_usage = Metric(self.session, name="token-usage", context={})

        # toy user actions implementation for demo purposes.
        # TODO: Aim api should allow more efficient way of querying the specific user from Aim.
        for cont in self.repo.containers(None, UserActivity):
            if cont["username"] == self.username:
                ua = cont
                for seq in ua.sequences:
                    user_actions = seq
                    break
                else:
                    user_actions = UserActions(ua, name="user-actions", context={})
                break
        else:
            ua = UserActivity(repo=self.repo)
            ua["username"] = self.username
            user_actions = UserActions(ua, name="user-actions", context={})

        self.user_activity = ua
        self.user_actions = user_actions


    def on_chain_start(
        self, serialized: Dict[str, Any], inputs: Dict[str, Any], **kwargs: Any
    ) -> None:
        inputs_res = deepcopy(inputs)
        if inputs_res.get("input"):
            self.start_inp = inputs_res['input']
        elif inputs_res.get("input_list"):
            self.start_inp = inputs_res['input_list']

    def on_chain_end(self, outputs: Dict[str, Any], **kwargs: Any) -> None:
        if self.start_inp:
            prompt_key = list(self.start_inp[0].keys())[0]
            for prompt, response in zip(self.start_inp, outputs["outputs"]):
                self.messages.track(Message(prompt[prompt_key], response["text"], self.agent_actions))
            self.start_inp = None

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> None:
        pass

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        result = deepcopy(response)
        self.tokens_usage_input.track(result.llm_output['token_usage']['prompt_tokens'])
        self.tokens_usage_output.track(result.llm_output['token_usage']['completion_tokens'])
        self.tokens_usage.track(result.llm_output['token_usage']['total_tokens'])


    def on_tool_start(
        self, serialized: Dict[str, Any], input_str: str, **kwargs: Any
    ) -> None:
        self.agent_actions.append(
            {
                "type": "tool-start",
                "input": input_str,
            }
        )

    def on_tool_end(self, output: str, **kwargs: Any) -> None:
        self.agent_actions.append(
            {
                "type": "tool-end",
                "input": output,
            }
        )
        self.used_tools.add(kwargs.get("name"))
        self.session.used_tools = list(self.used_tools)

    def on_agent_action(self, action: AgentAction, **kwargs: Any) -> Any:
        self.agent_actions.append(
            {
                "type": "agent-action",
                "tool": action.tool,
                "tool_input": action.tool_input,
            }
        )

    def on_agent_finish(
        self,
        finish: AgentFinish,
        **kwargs: Any,
    ) -> Any:
        self.end_out = finish.return_values['output']
        self.messages.track(Message(self.start_inp, self.end_out, self.agent_actions))
        self.start_inp = None
        self.end_out = None
        self.agent_actions = []