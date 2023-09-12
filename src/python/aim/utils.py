import random
from typing import Optional, Dict, Type, TYPE_CHECKING

from aim import Sequence, Container
from aim._core.storage.encoding import encode_path, decode_path

if TYPE_CHECKING:
    from aim import Repo


def _process_sequence_values(repo: 'Repo', values_list: list, steps_list: list, sequence: Sequence) -> list:
    # TODO V4: Move blobs uri handling to dump
    from aim._sdk.uri_service import URIService
    uri_service = URIService(repo)

    processed_values = []
    for step, val in zip(steps_list, values_list):
        if isinstance(val, list):
            processed_val = []
            for idx in range(len(val)):
                nested_val = val[idx]
                try:
                    processed_nested_val = nested_val.dump()
                    if not nested_val.RESOLVE_BLOBS:
                        khash_view = sequence._data.reservoir().container
                        khash_step = decode_path(
                            khash_view.to_khash(encode_path(step)))
                        additional_path = (*khash_step, 'val', idx, 'data')
                        resource_path = uri_service.generate_resource_path(
                            sequence._data.container, additional_path)
                        processed_nested_val['blobs'] = {
                            'data': uri_service.generate_uri(resource_path)}
                except AttributeError:
                    processed_nested_val = nested_val
                processed_val.append(processed_nested_val)
        else:
            try:
                processed_val = val.dump()
                if not val.RESOLVE_BLOBS:
                    khash_view = sequence._data.reservoir().container
                    khash_step = decode_path(
                        khash_view.to_khash(encode_path(step)))
                    additional_path = (*khash_step, 'val', 'data')
                    resource_path = uri_service.generate_resource_path(
                        sequence._data.container, additional_path)
                    processed_val['blobs'] = {
                        'data': uri_service.generate_uri(resource_path)}
            except AttributeError:
                processed_val = val
        processed_values.append(processed_val)

    return processed_values


def sequence_data(
        repo: 'Repo',
        sequence: Sequence,
        p: Optional[int],
        start: Optional[int],
        stop: Optional[int],
        sample_seed: str) -> Dict:
    data = {
        'name': sequence.name,
        'context': sequence.context,
        'container': {
            'hash': sequence._container_hash
        },
        'sequence_type': sequence.get_typename(),
        'sequence_full_type': sequence.get_full_typename(),
        'item_type': sequence.type,
        'axis_names': sequence.axis_names,
        'range': (sequence.start, sequence.stop),
        'axis': {},
        'steps': [],
        'values': [],
    }
    if p is None and start is None and stop is None:
        steps_list = list(sequence.steps())
        data['steps'] = steps_list
        data['values'] = _process_sequence_values(repo, list(
            sequence.values()), steps_list, sequence)
        for axis_name in sequence.axis_names:
            data['axis'][axis_name] = list(sequence.axis(axis_name))
    else:
        random.seed(sample_seed)  # use the query API qparams as sample seed
        try:
            steps, value_dicts = list(zip(*sequence[start:stop].sample(p)))
            value_lists = {k: [d[k] for d in value_dicts]
                           for k in value_dicts[0]}
            data['steps'] = steps
            data['values'] = _process_sequence_values(
                repo, value_lists.pop('val'), steps, sequence)
            data['axis'] = value_lists
        except Exception:
            pass

    return data


def container_data(container: Container) -> Dict:
    props = container.collect_properties()
    props.update({
        'container_type': container.get_typename(),
        'container_full_type': container.get_full_typename(),
        'hash': container.hash,
    })
    data = container[...]
    data.update({
        'hash': container.hash,
        '$properties': props,
    })
    return data


def container_type(typename: str) -> Optional[Type[Container]]:
    if typename in Container.registry:
        cont_types = Container.registry.get(typename)
        if len(cont_types) > 1:
            raise ValueError(f'Multiple matching container types for type name \'{typename}\'. '
                             f'Please include container package name.')
        return cont_types[0]
    else:
        return None


def sequence_type(typename: str) -> Optional[Type[Sequence]]:
    if typename in Sequence.registry:
        seq_types = Sequence.registry.get(typename)
        if len(seq_types) > 1:
            raise ValueError(f'Multiple matching sequence types for type name \'{typename}\'. '
                             f'Please include sequence package name.')
        return seq_types[0]
    else:
        return None
