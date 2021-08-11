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


__all__ = [
    'ArrayFlag',
    'ObjectFlag'
]
