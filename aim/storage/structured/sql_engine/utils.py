from abc import ABCMeta
from typing import Iterator, Collection, TypeVar, Union, Callable
from sqlalchemy import text

try:
    from typing import GenericMeta
except ImportError:
    class GenericMeta(type):
        pass

T = TypeVar('T')


class ModelMappedProperty:
    def __init__(self, name: str, mapped_name: str = None,
                 get_modifier: Callable = None,
                 with_setter: bool = True,
                 direct_setter: bool = False,
                 autogenerate: bool = True):
        self.name = name
        self.mapped_name = mapped_name or self.name
        self.get_modifier = get_modifier
        self.with_setter = with_setter
        self.direct_setter = direct_setter
        self.autogenerate = autogenerate

    def generate_property(self):
        def getter(object_):
            if self.get_modifier:
                return self.get_modifier(getattr(object_._model, self.mapped_name)) if object_._model else None
            else:
                return getattr(object_._model, self.mapped_name) if object_._model else None

        setter = None
        if self.with_setter or self.direct_setter:
            def direct_setter(object_, value):
                engine = object_._session.bind
                table_name = object_._model.__tablename__
                with engine.begin() as conn:
                    sql = text(f'UPDATE {table_name} SET {self.mapped_name} = :val WHERE id = :id')
                    conn.execute(sql, {'val': value, 'id': object_._id})

            def setter(object_, value):
                assert object_._model
                try:
                    setattr(object_._model, self.mapped_name, value)
                    object_._session.add(object_._model)
                    if getattr(object_._session, 'autocommit', True):
                        object_._session.commit()
                    else:
                        object_._session.flush()
                except Exception:
                    direct_setter(object_, value)

        if self.direct_setter:
            return property(getter, direct_setter)
        else:
            return property(getter, setter)


class ModelMappedCollection(Collection[T]):
    def __init__(self, session, **kwargs):
        # TODO: [AT] Find elegant way to check mutually exclusive args
        if ('query' not in kwargs and 'collection' not in kwargs) \
                or ('query' in kwargs and 'collection' in kwargs):
            raise ValueError('Cannot initialize ModelMappedCollection. Please provide \'query\' or \'collection\'.')

        self.session = session
        self.query = kwargs.get('query')
        self._cache = kwargs.get('collection')

    def _create_cache(self):
        self._it_cls = self.__orig_class__.__args__[0]
        if self._cache is None:
            self._cache = self.query.all()

    def __iter__(self) -> Iterator[T]:
        self._create_cache()
        self._idx = 0
        return self

    def __next__(self) -> T:
        if self._idx >= len(self._cache):
            raise StopIteration
        ret = self._it_cls.from_model(self._cache[self._idx], self.session)
        self._idx += 1
        return ret

    def __len__(self):
        if self._cache is not None:
            return len(self._cache)
        else:
            return self.query.count()

    def __contains__(self, item: Union[T, str]) -> bool:
        self._create_cache()
        if isinstance(item, str):
            match = next((i for i in self._cache if i.name == item), None)
            return match is not None
        elif isinstance(item, self._it_cls):
            match = next((i for i in self._cache if i.id == item._model.id), None)
            return match is not None
        return False


class ModelMappedClassMeta(GenericMeta, ABCMeta):
    __mapping__ = {}

    def __new__(mcls, name, bases, namespace, **kwargs):
        model = namespace.get('__model__')
        mapped_properties = namespace.get('__mapped_properties__')
        if not model:
            raise TypeError(f'Model-mapped class \'{name}\' attribute \'__model__\' must be set to mapped model.')

        if mcls.__mapping__.get(model):
            return mcls.__mapping__.get(model)

        schema = []
        for attribute in mapped_properties:
            if not isinstance(attribute, ModelMappedProperty):
                raise TypeError(f'Mapped property \'{attribute.name}\' should be of type \'MappedProperty\'.')
            schema.append(attribute.name)
            if attribute.autogenerate:
                namespace[attribute.name] = attribute.generate_property()
        namespace['__schema__'] = tuple(schema)

        def fields(cls):
            return cls.__schema__

        namespace['fields'] = classmethod(fields)
        type_ = ABCMeta.__new__(mcls, name, bases, namespace, **kwargs)
        mcls.__mapping__[model] = type_
        return type_
