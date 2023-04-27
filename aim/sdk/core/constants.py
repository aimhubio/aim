from enum import Enum


class ContainerOpenMode(Enum):
    READONLY = 1
    WRITE = 2
    FORCEWRITE = 3


class KeyNames:
    INFO_PREFIX = 'info_'
    CONTAINER_TYPE = 'cont_type'
    SEQUENCE_TYPE = 'seq_type'
    VALUE_TYPE = 'val_type'
    OBJECT_CATEGORY = 'object_category'

    SEQUENCES = 'sequences'
    CONTEXTS = 'contexts'
    CONTAINERS = 'containers'

    ALLOWED_VALUE_TYPES = 'allowed_val_types'
    CONTAINER_TYPES_MAP = 'cont_types_map'
    SEQUENCE_TYPES = 'seq_types'
    VALUE_TYPES = 'val_types'
