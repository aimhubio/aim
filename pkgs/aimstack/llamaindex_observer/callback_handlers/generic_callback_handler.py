import time
from typing import Optional, Any, Dict, List

from aim import Repo

try:
    from llama_index.callbacks.base_handler import BaseCallbackHandler
    from llama_index.callbacks.schema import CBEventType, EventPayload
except ImportError:
    # Raise an exception if LangChain is not installed.
    raise ImportError(
        "To use the GenericCallbackHandler for LlamaIndex, "
        "you need to have the `llama-index` python "
        "package installed. Please install it with `pip install llama-index`."
    )

from aimstack.llamaindex_observer.types.trace import Trace
from aimstack.llamaindex_observer.types.step import Step, StepSequence
from aimstack.llamaindex_observer.types.action import (
    EmbeddingAction,
    LLMAction,
    TemplatingAction,
    RetrieveAction,
    SynthesizeAction,
    QueryAction,
    EmbeddingEndAction,
    LLMEndAction,
    TemplatingEndAction,
    RetrieveEndAction,
    SynthesizeEndAction,
    QueryEndAction,
)


class GenericCallbackHandler(BaseCallbackHandler):
    """
    LlamaIndex callback handler that captures and logs events during LlamaIndex executions.

    This class is responsible for tracking various LlamaIndex activities and logging them.
    It handles events like the embedding, LLM, templating, retrieve, synthesize, and query.
    """

    def __init__(self, repo,
                 event_starts_to_ignore: Optional[List[CBEventType]] = [],
                 event_ends_to_ignore: Optional[List[CBEventType]] = [],
                 ):
        super().__init__(
            event_starts_to_ignore=event_starts_to_ignore,
            event_ends_to_ignore=event_ends_to_ignore,
        )
        self.repo = Repo.from_path(repo)
        self.trace = None
        self.steps = None
        self.steps_count = 0
        self.actions = []

        # Setup logging
        self.setup()

    def setup(self):
        """
        Initialize Aim logging types and logger.

        Note:
            This function is separated from __init__ for better readability and maintainability.
            However, it could be included in __init__ if desired.
        """
        if self.trace is not None:
            return
        self.trace = Trace(repo=self.repo)
        self.trace['date'] = time.time()
        self.steps = StepSequence(self.trace, name='actions', context={})

    def flush(self):
        """
        Flush all captured actions into a single Step and log it into StepSequence.

        After flushing, it resets the actions and used_tools for the next set of operations.
        """
        self.steps.track(Step(self.actions))
        self.actions = []
        self.steps_count += 1
        self.trace['steps_count'] = self.steps_count
        self.trace['cost'] = 0

    def on_event_start(self, event_type: str,
                       payload: Optional[Dict[str, Any]] = None,
                       event_id: str = "", **kwargs: Any) -> str:
        """
        Handle the event when it starts.
        """
        if event_type == CBEventType.EMBEDDING:
            serialized_data = payload.get(EventPayload.SERIALIZED)
            self.actions.append(
                EmbeddingAction(
                    model_name=serialized_data.get('model_name', '-'),
                    batch_size=serialized_data.get('embed_batch_size', 0),
                )
            )
        elif event_type == CBEventType.LLM:
            messages_payload = payload.get(EventPayload.MESSAGES)
            serialized_data = payload.get(EventPayload.SERIALIZED)

            messages = []
            for message in messages_payload:
                messages.append(message.content)

            self.actions.append(
                LLMAction(
                    messages=messages,
                    model_name=serialized_data.get('model', '-'),
                    temperature=serialized_data.get('temperature', 0)
                )
            )
        elif event_type == CBEventType.TEMPLATING:
            template_text = payload.get(EventPayload.TEMPLATE, '')
            template_vars = payload.get(EventPayload.TEMPLATE_VARS, {})
            self.actions.append(
                TemplatingAction(
                    template_text=template_text,
                    template_vars=template_vars
                )
            )
        elif event_type == CBEventType.RETRIEVE:
            self.actions.append(
                RetrieveAction(
                    query_text=payload.get(EventPayload.QUERY_STR)
                )
            )
        elif event_type == CBEventType.SYNTHESIZE:
            self.actions.append(
                SynthesizeAction(
                    query_text=payload.get(EventPayload.QUERY_STR)
                )
            )
        elif event_type == CBEventType.QUERY:
            self.actions.append(
                QueryAction(
                    query_text=payload.get(EventPayload.QUERY_STR)
                )
            )

        # print('SSS #' * 10)
        # print(event_type, payload)
        # print('SSS #' * 10)
        return event_id

    def on_event_end(
            self,
            event_type: CBEventType,
            payload: Optional[Dict[str, Any]] = None,
            event_id: str = "",
            **kwargs: Any,
    ) -> None:
        """Run when an event ends."""
        if event_type == CBEventType.EMBEDDING:
            chunks = payload.get(EventPayload.CHUNKS, [])
            self.actions.append(
                EmbeddingEndAction(
                    chunks=chunks
                )
            )
        elif event_type == CBEventType.LLM:
            messages_payload = payload.get(EventPayload.MESSAGES)
            response_payload = payload.get(EventPayload.RESPONSE)
            messages = []
            for message in messages_payload:
                messages.append(message.content)
            if response_payload:
                response_content = response_payload.message.content
                response_meta = response_payload.raw
                token_usage_res = response_meta.get('usage', {})
            else:
                response_content = ''
                response_meta = {}
                token_usage_res = {}
            token_usage = {
                'prompt_tokens': token_usage_res.get('prompt_tokens', 0),
                'completion_tokens': token_usage_res.get('completion_tokens', 0),
                'total_tokens': token_usage_res.get('total_tokens', 0),
            }
            self.actions.append(
                LLMEndAction(
                    messages=messages,
                    response=response_content,
                    model_name=response_meta.get('model', '-'),
                    token_usage=token_usage
                )
            )
        elif event_type == CBEventType.TEMPLATING:
            self.actions.append(
                TemplatingEndAction()
            )
        elif event_type == CBEventType.RETRIEVE:
            nodes_payload = payload.get(EventPayload.NODES, [])
            nodes_content = []
            for node in nodes_payload:
                nodes_content.append({
                    'text': node.node.text,
                    'score': node.score,
                })
            self.actions.append(
                RetrieveEndAction(
                    nodes=nodes_content,
                )
            )
        elif event_type == CBEventType.SYNTHESIZE:
            response = payload.get(EventPayload.RESPONSE)
            if response:
                response_content = response.response
            else:
                response_content = ''
            self.actions.append(
                SynthesizeEndAction(
                    response=response_content
                )
            )
        elif event_type == CBEventType.QUERY:
            response = payload.get(EventPayload.RESPONSE)
            if response:
                response_content = response.response
            else:
                response_content = ''
            self.actions.append(
                QueryEndAction(
                    response=response_content
                )
            )
        # print('EEE #' * 10)
        # print(event_type, payload)
        # print('EEE #' * 10)

    def start_trace(self, trace_id: Optional[str] = None) -> None:
        """Run when an overall trace is launched."""
        pass

    def end_trace(
            self,
            trace_id: Optional[str] = None,
            trace_map: Optional[Dict[str, List[str]]] = None,
    ) -> None:
        """Run when an overall trace is exited."""
        pass
