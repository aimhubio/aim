from aim._core.storage.object import CustomObject as AimStorageObject
from aim._sdk.blob import BLOB


@AimStorageObject.alias('aim.Object')
class Object(AimStorageObject):
    AIM_NAME = 'aim.Object'
    RESOLVE_BLOBS = False

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

    def dump(self):
        # TODO: V4 handle nested blob values
        data = self.storage[...]

        keys_list = list(data.keys())
        for key in keys_list:
            if isinstance(data[key], BLOB):
                if self.RESOLVE_BLOBS:
                    data[key] = data[key].load()

        return data

