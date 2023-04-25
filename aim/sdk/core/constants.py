from enum import Enum


class ContainerOpenMode(Enum):
    READONLY = 1
    WRITE = 2
    FORCEWRITE = 3


class KeyNames:
    INFO_PREFIX = '_info'
    CONTAINER_TYPE = 'cont_type'
    SEQUENCE_TYPE = 'seq_type'
    VALUE_TYPE = 'val_type'
    SEQUENCES = 'sequences'
    CONTEXTS = 'contexts'
    CONTAINERS = 'containers'

    ALLOWED_VALUE_TYPES = 'allowed_val_types'
    CONTAINER_TYPES = 'cont_types'
    SEQUENCE_TYPES = 'seq_types'

