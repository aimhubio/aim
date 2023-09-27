from aim import Repo, Sequence, Container
from aim.utils import sequence_data


def get_project_stats():
    repo = Repo.active_repo()

    container_types = repo.tracked_container_types()
    sequence_types = repo.tracked_sequence_types()

    container_stats = {}
    for type_ in container_types:
        container_stats[type_] = repo.containers(type_=type_).count()

    sequence_stats = {}
    for type_ in sequence_types:
        sequence_stats[type_] = repo.sequences(type_=type_).count()

    return {
        'containers': container_stats,
        'sequences': sequence_stats
    }


def get_container_type_preview(type_: str):
    repo = Repo.active_repo()

    for container in repo.containers(type_=type_):
        container_full_type = container.get_logged_typename()
        container_type = container_full_type.split('->')[-1]
        container_data = {
            'hash': container.hash,
            'container_type': container_type,
            'container_full_type': container_full_type,
        }
        container_data.update(container.collect_properties())
        yield container_data


def get_sequence_type_preview(type_: str):
    repo = Repo.active_repo()

    for sequence in repo.sequences(type_=type_):
        sequence_full_type = sequence.get_logged_typename()
        sequence_type = sequence_full_type.split('->')[-1]
        yield {
            'name': sequence.name,
            'context': sequence.context,
            'hash': sequence._container_hash,
            'sequence_type': sequence_type,
            'sequence_full_type': sequence_full_type,
            'value_type': sequence.type,
            'axis_names': sequence.axis_names,
            'range': (sequence.start, sequence.stop),
        }
