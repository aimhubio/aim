from abc import ABCMeta
from typing import Iterable, Iterator, TypeVar

T = TypeVar('T')


class ModelMappedProperty:
    def __init__(self, name: str, mapped_name: str = None, with_setter: bool = True):
        self.name = name
        self.mapped_name = mapped_name or self.name
        self.with_setter = with_setter

    def generate_property(self):
        def getter(object_):
            return getattr(object_._model, self.mapped_name) if object_._model else None

        setter = None
        if self.with_setter:
            def setter(object_, value):
                if not object_._model:
                    object_.create_model_instance()
                setattr(object_._model, self.mapped_name, value)
                object_._session.add(object_._model)
        return property(getter, setter)


# TODO: [AT] Switch to typing.Collection
class ModelMappedCollection(Iterable[T]):
    def __init__(self, q, session):
        self.query = q
        self.session = session
        self._cache = []

    def __iter__(self) -> Iterator[T]:
        self._it_cls = self.__orig_class__.__args__[0]
        self._cache = self.query.all()
        self._idx = 0
        return self

    def __next__(self) -> T:
        if self._idx >= len(self._cache):
            raise StopIteration
        ret = self._it_cls.from_model(self._cache[self._idx], self.session)
        self._idx += 1
        return ret


class ModelMappedClassMeta(ABCMeta):
    __mapping__ = {}

    def __new__(mcls, name, bases, namespace, **kwargs):
        model = namespace.get('__model__')
        mapped_properties = namespace.get('__mapped_properties__')
        if not model:
            raise TypeError(f'Model-mapped class \'{name}\' attribute \'__model__\' must be set to mapped model.')

        if mcls.__mapping__.get(model):
            return mcls.__mapping__.get(model)
            # raise TypeError(f'Model \'{model.__name__}\' has already been mapped.')

        for attribute in mapped_properties:
            if not isinstance(attribute, ModelMappedProperty):
                raise TypeError(f'Mapped property \'{attribute.name}\' should be of type \'MappedProperty\'.')
            namespace[attribute.name] = attribute.generate_property()
        type_ = ABCMeta.__new__(mcls, name, bases, namespace, **kwargs)
        mcls.__mapping__[model] = type_
        return type_
