from typing import Dict, Any, Union


class Trace(object):
    def __init__(self, repo, experiment_name: str,
                 run_hash: str, context: list):
        self.repo = repo
        self.experiment_name = experiment_name
        self.run_hash = run_hash
        self.context: Dict[str, Union[str, Any]] = {
            k: v for (k, v) in context
        }

    def __repr__(self):
        return str(self.context)

    def __len__(self):
        return 0

    def open(self):
        pass
