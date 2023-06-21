from aim import Repo


def _get_query_collection_count(coll):
    return sum(1 for _ in coll)


def get_project_stats():
    repo = Repo.active_repo()
    container_types = repo.tracked_container_types()
    sequence_types = repo.tracked_sequence_types()

    container_stats = {}
    for type_ in container_types:
        container_stats[type_] = _get_query_collection_count(repo.containers(type_=type_))

    sequence_stats = {}
    for type_ in sequence_types:
        sequence_stats[type_] = _get_query_collection_count(repo.sequences(type_=type_))

    return {
        'containers': container_stats,
        'sequences': sequence_stats
    }
