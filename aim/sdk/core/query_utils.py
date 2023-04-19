from typing import Dict, Any, Union


class ContextDictView:
    def __init__(self, context_dict: Dict):
        self.context_dict = context_dict

    def __getitem__(self, key):
        return self.context_dict[key]

    def get(self, key, default: Any = None):
        try:
            return self.__getitem__(key)
        except KeyError:
            return default

    def view(self, key: Union[int, str]):
        return ContextDictView(self.context_dict[key])
