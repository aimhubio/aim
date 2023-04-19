def auto_registry(cls):
    @classmethod
    def get_typename_fn(cls_):
        if hasattr(cls_, '__aim_module__'):
            return f'{cls_.__aim_module__}.{cls_.__name__}'
        return cls.__name__

    @classmethod
    def get_full_typename_fn(cls_):
        if cls_ == cls:
            return cls_.get_typename()
        for base in cls_.__bases__:
            if issubclass(base, cls):
                base_typename = base.get_full_typename()
                typename = cls_.get_typename()
                return '->'.join((base_typename, typename))

    cls.get_typename = get_typename_fn
    cls.get_full_typename = get_full_typename_fn
    cls.registry = {cls.get_typename(): cls}

    return cls


def query_alias(*names: str):
    def cls_decorator(cls):
        cls.default_aliases.update(names)
        return cls
    return cls_decorator
