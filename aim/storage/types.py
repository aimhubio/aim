from typing import Dict, List, Tuple, Union


NoneType = type(None)


AimObjectKey = Union[int, str]
AimObjectPath = Tuple[AimObjectKey, ...]
AimObjectPrimitive = Union[
    NoneType,
    bool,
    int,
    float,
    str,
    bytes
]
AimObjectArray = Union[List['AimObject'], Tuple['AimObject', ...]]
AimObjectDict = Dict[AimObjectKey, 'AimObject']
AimObject = Union[
    AimObjectPrimitive,
    AimObjectArray,
    AimObjectDict
]
