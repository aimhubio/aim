import openai


class ChatCompletion:
    @classmethod
    def create(cls, aim_callback, *args, **kwargs):
        aim_callback.on_event_start(payload=kwargs)
        chat_completion = openai.ChatCompletion.create(*args, **kwargs)
        aim_callback.on_event_end(payload=chat_completion)
