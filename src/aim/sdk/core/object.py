from aim.core.storage.object import CustomObject as AimStorageObject


@AimStorageObject.alias('aim.Object')
class Object(AimStorageObject):
    AIM_NAME = 'aim.Object'

    @classmethod
    def get_full_typename(cls):
        if cls == Object:
            return cls.get_typename()
        # if hasattr(cls, 'extends'):
        #     extended_cls = getattr(cls, 'extends')
        #     assert issubclass(extended_cls, Object)

        for base in cls.__bases__:
            if issubclass(base, Object):
                base_typename = base.get_full_typename()
                typename = cls.get_typename()
                return '->'.join((base_typename, typename))

    @staticmethod
    def extends(co_cls):
        assert issubclass(co_cls, Object)

        def decorator(cls):
            setattr(cls, '__extends', co_cls)
            return cls

        return decorator
