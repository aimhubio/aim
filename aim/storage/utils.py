class ArrayFlagType:
    def __repr__(self):
        return "<ArrayFlag>"

    def __copy__(self) -> 'ArrayFlagType':
        return self

    def __deepcopy__(self, memo) -> 'ArrayFlagType':
        return self


ArrayFlag = ArrayFlagType()


class ObjectFlagType:
    def __repr__(self):
        return "<ObjectFlag>"

    def __copy__(self) -> 'ObjectFlagType':
        return self

    def __deepcopy__(self, memo) -> 'ObjectFlagType':
        return self


ObjectFlag = ObjectFlagType()


class CustomObjectFlagType:
    def __init__(self, aim_name: str):
        self.aim_name = aim_name

    def __repr__(self):
        return f"<CustomObjectFlag type={self.aim_name}>"


__all__ = [
    'ArrayFlag',
    'ObjectFlag',
    'CustomObjectFlagType',
]
