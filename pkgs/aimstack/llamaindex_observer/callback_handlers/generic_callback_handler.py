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

from aimstack.base import Metric
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
        self.tokens_usage_input = None
        self.tokens_usage_output = None
        self.tokens_usage = None

        self.actions = []

        self.step_total_tokens_count = 0
        self.step_cost = 0

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

        self.steps = StepSequence(self.trace, name='actions', context={})

        self.tokens_usage_input = Metric(self.trace, name='token-usage-input',
                                         context={})
        self.tokens_usage_output = Metric(self.trace, name='token-usage-output',
                                          context={})
        self.tokens_usage = Metric(self.trace, name='token-usage', context={})

    def flush(self):
        """
        Flush all captured actions into a single Step and log it into StepSequence.

        After flushing, it resets the actions and used_tools for the next set of operations.
        """
        self.steps.track(Step(self.actions))
        self.actions = []

        steps_count = self.trace.get('steps_count', 0)
        steps_count += 1
        self.trace['steps_count'] = steps_count

        all_tokens = self.trace.get('tokens_count', 0)
        all_tokens += self.step_total_tokens_count
        self.trace['tokens_count'] = all_tokens
        self.step_total_tokens_count = 0

        total_cost = self.trace.get('cost', 0)
        total_cost += self.step_cost
        self.trace['cost'] = total_cost
        self.step_cost = 0

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
            query_str = payload.get(EventPayload.QUERY_STR)
            self.actions.append(
                QueryAction(
                    query_text=query_str
                )
            )

            # Log the latest query message
            self.trace['latest_query'] = query_str
            self.trace['latest_response'] = ''

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
                'completion_tokens': token_usage_res.get('completion_tokens',
                                                         0),
                'total_tokens': token_usage_res.get('total_tokens', 0),
            }
            model_name = response_meta.get('model', '-')

            # Tokens calculation
            self.step_total_tokens_count += token_usage['prompt_tokens'] + \
                                            token_usage['completion_tokens']

            # Cost calculation
            prompt_cost_val = 0
            output_cost_val = 0
            unknown_cost_val = False
            if model_name.startswith('gpt-3.5'):
                prompt_cost_val = 0.002
                output_cost_val = 0.002
            elif model_name.startswith('gpt-4-32K'):
                prompt_cost_val = 0.12
                output_cost_val = 0.06
            elif model_name.startswith('gpt-4'):
                prompt_cost_val = 0.03
                output_cost_val = 0.06
            else:
                unknown_cost_val = True

            if not unknown_cost_val:
                input_price = token_usage[
                                  'prompt_tokens'] * prompt_cost_val / 1000
                output_price = token_usage[
                                   'completion_tokens'] * output_cost_val / 1000
                total_price = input_price + output_price
                self.step_cost += total_price

            # Tokens usage tracking
            self.tokens_usage_input.track(token_usage['prompt_tokens'])
            self.tokens_usage_output.track(token_usage['completion_tokens'])
            self.tokens_usage.track(token_usage['total_tokens'])

            # Append the action
            self.actions.append(
                LLMEndAction(
                    messages=messages,
                    response=response_content,
                    model_name=model_name,
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

            # Log the latest query response
            self.trace['latest_response'] = response_content

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
