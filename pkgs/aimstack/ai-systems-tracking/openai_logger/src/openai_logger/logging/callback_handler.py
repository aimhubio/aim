import time
from typing import Any, Dict, Optional

from aim import Repo
from aimstack.asp import Metric
from langchain_logger import (Message, MessagesSequence, SessionDev,
                              SessionProd, UserActions, UserActivity)
from openai_logger import Experiment, Release
from openai_logger.utils import get_version

"""
There are three main building blocks in Aim logging:
- Objects: a unit of data being saved. Ex. Number, Image, Text etc.
- Sequences: a sequences of objects.
- Containers: a set of interconnected sequences of objects

These constructs enable a unique way of modeling all the relationships in the software being tracked.
Below is an example of how such objects can be tracked and saved for langchain.
"""


class AimCallbackHandler:
    def __init__(
        self,
        username,
        dev_mode,
        experiment=None,
        repo_path='aim://0.0.0.0:53800',
        **extras: Any,
    ) -> None:
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

        self.user_history = []
        self.assistant_history = []

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
                'version': version,
                'time': time.time(),
            }

        if self.dev_mode:
            self.experiment = Experiment(repo=self.repo)
            self.experiment['release'] = release.hash
            self.experiment['version'] = version
            self.experiment['started'] = time.time()

        if self.experiment is not None:
            for key, value in self.extras.items():
                if isinstance(value, list):
                    self.experiment[key] = [item.__dict__ for item in value]
                elif isinstance(value, str):
                    self.experiment[key] = value
                else:
                    self.experiment[key] = value.__dict__

        if self.dev_mode:
            self.session = SessionDev(repo=self.repo)
        else:
            self.session = SessionProd(repo=self.repo)

        model_name = ''
        if self.extras.get('llm'):
            model_name = self.extras.get('model')

        self.session[...] = {
            'chatbot_version': version,
            'model': model_name,
            'username': self.username,
            'started': time.time(),
            'experiment': self.experiment.hash if self.experiment else None,
            'release': release.hash,
        }

        # System metrics will be tracked by default.
        # TODO - getting an error on this
        # self.session.enable_system_monitoring()

        # Define what needs to be tracked as a result of langchain execution
        self.messages = MessagesSequence(self.session, name='messages', context={})

        self.tokens_usage_input = Metric(
            self.session, name='token-usage-input', context={}
        )

        self.tokens_usage_output = Metric(
            self.session, name='token-usage-output', context={}
        )

        self.tokens_usage = Metric(self.session, name='token-usage', context={})

        # toy user actions implementation for demo purposes.
        # TODO: Aim api should allow more efficient way of querying the specific user from Aim.
        for cont in self.repo.containers(None, UserActivity):
            if cont['username'] == self.username:
                ua = cont
                for seq in ua.sequences:
                    user_actions = seq
                    break
                else:
                    user_actions = UserActions(ua, name='user-actions', context={})
                break
        else:
            ua = UserActivity(repo=self.repo)
            ua['username'] = self.username
            user_actions = UserActions(ua, name='user-actions', context={})

        self.user_activity = ua
        self.user_actions = user_actions

    def on_event_start(
        self,
        payload: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> str:
        messages = payload.get('messages')
        for message in messages:
            if message.get('role') == 'user':
                self.user_history.append(message.get('content'))
            elif message.get('role') == 'assistant':
                self.assistant_history.append(message.get('content'))
            else:
                raise KeyError(f"Message with key {message.get('role')} not found")

    def on_event_end(
        self,
        payload: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        self.assistant_history.append(payload.choices[0].message.content)

        for user_msg, assistant_msg in zip(self.user_history, self.assistant_history):
            self.messages.track(Message(user_msg, assistant_msg, self.agent_actions))

        self.tokens_usage_input.track(payload.usage.prompt_tokens)
        self.tokens_usage_output.track(payload.usage.completion_tokens)

        self.user_history = []
        self.assistant_history = []
