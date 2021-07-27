from typing import Optional, Iterable
from sqlalchemy.orm import joinedload

from aim.storage.run_metadata.entities import \
    Run as IRun, \
    Experiment as IExperiment, \
    Tag as ITag,\
    RunCollection, TagCollection, SafeNone
from aim.storage.run_metadata.sql_engine.models import \
    Run as RunModel,\
    Experiment as ExperimentModel,\
    Tag as TagModel
from aim.storage.run_metadata.sql_engine.utils import ModelMappedClassMeta, ModelMappedCollection
from aim.storage.run_metadata.sql_engine.utils import ModelMappedProperty as Property


class ModelMappedRun(IRun, metaclass=ModelMappedClassMeta):
    __model__ = RunModel
    __mapped_properties__ = [
        Property('name'),
        Property('description'),
        Property('hash', with_setter=False),
        Property('archived', 'is_archived'),
        Property('created_at', with_setter=False),
        Property('updated_at', with_setter=False),
    ]

    def __init__(self, _hash: str, session):
        self._hash = _hash
        self._model = None
        self._session = session

    @classmethod
    def from_model(cls, model_obj, session):
        _hash = model_obj.hash
        run = ModelMappedRun(_hash, session)
        run._model = model_obj
        return run

    def create_model_instance(self):
        if self._model:
            # TODO: [AT] provide error message
            raise ValueError()
        session = self._session
        model_inst = session.query(RunModel).filter(RunModel.hash == self._hash).first()
        if not model_inst:
            model_inst = RunModel(self._hash)
            session.add(model_inst)
        self._model = model_inst

    @classmethod
    def find(cls, _id: str, **kwargs) -> Optional[IRun]:
        session = kwargs.get('session')
        if not session:
            return None
        model_obj = session.query(RunModel).options([
            joinedload(RunModel.experiment),
            joinedload(RunModel.tags),
        ]).filter(RunModel.hash == _id).first()
        if model_obj:
            return ModelMappedRun.from_model(model_obj, session)
        return ModelMappedRun(_id, session)

    @classmethod
    def all(cls, **kwargs) -> Iterable[IRun]:
        session = kwargs.get('session')
        if not session:
            return []
        q = session.query(RunModel).options([
            joinedload(RunModel.experiment),
            joinedload(RunModel.tags),
        ])
        return ModelMappedRunCollection(q, session=session)

    @classmethod
    def search(cls, term: str, **kwargs) -> Iterable[IRun]:
        session = kwargs.get('session')
        if not session:
            return []
        term = f'%{term}%'
        q = session.query(RunModel).options([
            joinedload(RunModel.experiment),
            joinedload(RunModel.tags),
        ]).filter(RunModel.name.like(term))
        return ModelMappedRunCollection(q, session=session)

    @property
    def experiment(self) -> Optional[IExperiment]:
        if self._model and self._model.experiment:
            return ModelMappedExperiment(self._model.experiment, self._session)
        else:
            return SafeNone()

    @experiment.setter
    def experiment(self, value: str):
        session = self._session
        if not self._model:
            self.create_model_instance()
        if value is None:
            exp = None
        else:
            exp = session.query(ExperimentModel).filter(ExperimentModel.name == value).first()
            if not exp:
                exp = ExperimentModel(value)
                session.add(exp)
        self._model.experiment = exp
        session.add(self._model)
        session.flush()

    @property
    def tags(self) -> TagCollection:
        if self._model:
            return (ModelMappedTag.from_model(tag, self._session) for tag in self._model.tags)
        else:
            return []

    def add_tag(self, value: str):
        if not self._model:
            self.create_model_instance()
        session = self._session
        tag = session.query(TagModel).filter(TagModel.name == value).first()
        if not tag:
            tag = TagModel(value)
            session.add(tag)
        self._model.tags.append(tag)
        session.add(self._model)


class ModelMappedExperiment(IExperiment, metaclass=ModelMappedClassMeta):
    __model__ = ExperimentModel
    __mapped_properties__ = [
        Property('name'),
        Property('uuid', with_setter=False),
        Property('created_at', with_setter=False),
        Property('updated_at', with_setter=False),
    ]

    def __init__(self, model_inst: ExperimentModel, session):
        self._model = model_inst
        self._session = session

    @classmethod
    def from_model(cls, model_obj, session):
        return ModelMappedExperiment(model_obj, session)

    @property
    def runs(self) -> RunCollection:
        return (ModelMappedRun.from_model(run, self._session) for run in self._model.runs)

    @classmethod
    def find(cls, _id: str, **kwargs) -> Optional[IExperiment]:
        session = kwargs.get('session')
        if not session:
            return None
        model_obj = session.query(ExperimentModel).options([
            joinedload(ExperimentModel.runs),
        ]).filter(ExperimentModel.uuid == _id).first()
        if model_obj:
            return ModelMappedExperiment(model_obj, session)
        return None

    @classmethod
    def all(cls, **kwargs) -> Iterable[IExperiment]:
        session = kwargs.get('session')
        if not session:
            return []
        q = session.query(ExperimentModel).options([
            joinedload(ExperimentModel.runs),
        ])
        return ModelMappedExperimentCollection(q, session=session)

    @classmethod
    def search(cls, term: str, **kwargs) -> Iterable[IExperiment]:
        session = kwargs.get('session')
        if not session:
            return []
        term = f'%{term}%'
        q = session.query(ExperimentModel).options([
            joinedload(ExperimentModel.runs),
        ]).filter(ExperimentModel.name.like(term))
        return ModelMappedExperimentCollection(q, session=session)


class ModelMappedTag(ITag, metaclass=ModelMappedClassMeta):
    __model__ = TagModel
    __mapped_properties__ = [
        Property('name'),
        Property('color'),
        Property('uuid', with_setter=False),
        Property('created_at', with_setter=False),
        Property('updated_at', with_setter=False),
    ]

    def __init__(self, model_inst: TagModel, session):
        self._model = model_inst
        self._session = session

    @classmethod
    def from_model(cls, model_obj, session):
        return ModelMappedTag(model_obj, session)

    @classmethod
    def find(cls, _id: str, **kwargs) -> Optional[ITag]:
        session = kwargs.get('session')
        if not session:
            return None
        model_obj = session.query(TagModel).options([
            joinedload(TagModel.runs),
        ]).filter(TagModel.uuid == _id).first()
        if model_obj:
            return ModelMappedTag(model_obj, session)
        return None

    @classmethod
    def all(cls, **kwargs) -> Iterable[ITag]:
        session = kwargs.get('session')
        if not session:
            return []
        q = session.query(TagModel).options([
            joinedload(TagModel.runs),
        ])
        return ModelMappedTagCollection(q, session=session)

    @classmethod
    def search(cls, term: str, **kwargs) -> Iterable[ITag]:
        session = kwargs.get('session')
        if not session:
            return []
        term = f'%{term}%'
        q = session.query(TagModel).options([
            joinedload(TagModel.runs),
        ]).filter(TagModel.name.like(term))
        return ModelMappedTagCollection(q, session=session)

    @property
    def runs(self) -> RunCollection:
        return (ModelMappedRun.from_model(run, self._session) for run in self._model.runs)


ModelMappedRunCollection = ModelMappedCollection[ModelMappedRun]
ModelMappedExperimentCollection = ModelMappedCollection[ModelMappedExperiment]
ModelMappedTagCollection = ModelMappedCollection[ModelMappedTag]
