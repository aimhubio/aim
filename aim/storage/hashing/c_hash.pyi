from typing import overload


@overload
def det_hash(v: float) -> int:
    ...
