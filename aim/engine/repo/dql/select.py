from typing import List, Dict, Tuple
import copy

from aim.engine.repo.run import Run
from aim.engine.configs import AIM_MAP_METRICS_KEYWORD
from aim.engine.utils import compressed_dict


class SelectResult(object):
    def __init__(self, fields: List[str] = []):
        self._fields = fields  # type: List[str]
        self._runs = []  # type: List[Run]

    @property
    def fields(self):
        return self._fields

    @property
    def runs(self):
        return self._runs

    @runs.setter
    def runs(self, runs):
        self._runs = list(set(runs))

    def append_run(self, run: Run):
        self._runs.append(run)
        self._runs = list(set(self._runs))

    def get_all_params(self):
        all_params = []
        for run in self._runs:
            params = copy.deepcopy(run.params)
            if AIM_MAP_METRICS_KEYWORD in params:
                del params[AIM_MAP_METRICS_KEYWORD]
            all_params.append(params)
        return all_params

    def get_all_params_paths(self):
        params_paths = set()
        runs_params = self.get_all_params()
        for run_params in runs_params:
            run_params_compressed = compressed_dict(run_params)
            for p in run_params_compressed.keys():
                params_paths.add(p)
        return list(params_paths)

    def get_selected_params(self):
        all_params = self.get_all_params_paths()
        selected_params = list(set(self._fields) & set(all_params))
        return selected_params

    def get_selected_metric_names(self) -> List[str]:
        selected_metrics = set()
        for run in self._runs:
            for metric_name in run.metrics.keys():
                if metric_name in self._fields:
                    selected_metrics.add(metric_name)
        return list(selected_metrics)

    def get_selected_metrics_context(self) -> dict:
        selected_metrics = {}  # type: Dict[str, List[Tuple[Dict, Tuple]]]
        for run in self._runs:
            for metric_name, metric in run.metrics.items():
                if metric_name in self._fields:
                    selected_metrics.setdefault(metric_name, [])
                    for trace in metric.traces:
                        for added_context in selected_metrics[metric_name]:
                            if trace.eq_context(added_context[1]):
                                break
                        else:
                            selected_metrics[metric_name].append((
                                trace.context,
                                trace.hashable_context,
                            ))

        for metric_contexts in selected_metrics.values():
            for i, context in enumerate(metric_contexts):
                metric_contexts[i] = context[0]
        return selected_metrics

    # def get_selected_metrics_values(self) -> dict:
    #     all_params = []
    #     for run in self._runs:
    #         params = copy.deepcopy(run.params)
    #         if AIM_MAP_METRICS_KEYWORD not in params:
    #             continue
    #         metrics = params[AIM_MAP_METRICS_KEYWORD]
    #         all_params.append(params)
    #     return all_params
