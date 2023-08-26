from typing import Any, Dict, List, Optional

from aim import Repo
from aimstack.asp import Metric
from llama_index.callbacks.base import BaseCallbackHandler
from llama_index.callbacks.schema import CBEventType, EventPayload

from llamaindex_logger import (
    Message,
    MessagesSequence,
    Chunk,
    ChunkSequence,
    SessionDev,
    SessionProd,
    UserActions,
    UserActivity,
)

from llamaindex_logger.utils import get_version
from llamaindex_logger import Experiment, Release
import time

"""
There are three main building blocks in Aim logging:
- Objects: a unit of data being saved. Ex. Number, Image, Text etc.
- Sequences: a sequences of objects.
- Containers: a set of interconnected sequences of objects

These constructs enable a unique way of modeling all the relationships in the software being tracked.
Below is an example of how such objects can be tracked and saved for langchain.
"""


class AimCallbackHandler(BaseCallbackHandler):
    def __init__(
        self,
        username,
        dev_mode,
        experiment=None,
        repo_path="aim://0.0.0.0:53800",
        event_starts_to_ignore: Optional[List[CBEventType]] = None,
        event_ends_to_ignore: Optional[List[CBEventType]] = None,
        **extras: Any,
    ) -> None:
        event_starts_to_ignore = (
            event_starts_to_ignore if event_starts_to_ignore else []
        )
        event_ends_to_ignore = event_ends_to_ignore if event_ends_to_ignore else []

        super().__init__(
            event_starts_to_ignore=event_starts_to_ignore,
            event_ends_to_ignore=event_ends_to_ignore,
        )

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

        self.query = None
        self.responses = []

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

        # Define what needs to be tracked as a result of langchain execution
        self.messages = MessagesSequence(self.session, name="messages", context={})

        self.doc_chunks = ChunkSequence(self.session, name="document", context={})

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

    def on_event_start(
        self,
        event_type: CBEventType,
        payload: Optional[Dict[str, Any]] = None,
        event_id: str = "",
        **kwargs: Any,
    ) -> str:
        """
        Args:
            event_type (CBEventType): event type to store.
            payload (Optional[Dict[str, Any]]): payload to store.
            event_id (str): event id to store.
        """
        if event_type is CBEventType.QUERY:
            if EventPayload.QUERY_STR in payload:
                self.query = payload[EventPayload.QUERY_STR]

    def on_event_end(
        self,
        event_type: CBEventType,
        payload: Optional[Dict[str, Any]] = None,
        event_id: str = "",
        **kwargs: Any,
    ) -> None:
        """
        Args:
            event_type (CBEventType): event type to store.
            payload (Optional[Dict[str, Any]]): payload to store.
            event_id (str): event id to store.
        """
        if event_type is CBEventType.LLM and payload:
            if EventPayload.RESPONSE in payload:
                self.responses.append(payload[EventPayload.RESPONSE].message.content)
                # TODO - track the usage
                # "usage": {
                #     "prompt_tokens": 3597,
                #     "completion_tokens": 29,
                #     "total_tokens": 3626
                # }
                # dict(payload[EventPayload.RESPONSE].raw.usage)
        elif event_type is CBEventType.CHUNKING and payload:
            for chunk_id, chunk in enumerate(payload[EventPayload.CHUNKS]):
                self.doc_chunks.track(Chunk(chunk_id, chunk, self.agent_actions))

    def start_trace(self, trace_id: Optional[str] = None) -> None:
        pass

    def end_trace(
        self,
        trace_id: Optional[str] = None,
        trace_map: Optional[Dict[str, List[str]]] = None,
    ) -> None:
        if trace_id == "query":
            if self.query and self.responses:
                for response in self.responses:
                    self.messages.track(
                        Message(self.query, response, self.agent_actions)
                    )
                self.query = None
                self.responses = []
