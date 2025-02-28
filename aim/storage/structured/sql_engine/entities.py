import logging

from typing import Collection, List, Optional, Union

import pytz

from aim.storage.structured.entities import Experiment as IExperiment
from aim.storage.structured.entities import Note as INote
from aim.storage.structured.entities import NoteCollection, RunCollection, TagCollection
from aim.storage.structured.entities import Run as IRun
from aim.storage.structured.entities import RunInfo as IRunInfo
from aim.storage.structured.entities import Tag as ITag
from aim.storage.structured.sql_engine.models import Experiment as ExperimentModel
from aim.storage.structured.sql_engine.models import Note as NoteModel
from aim.storage.structured.sql_engine.models import NoteAuditLog as NoteAuditLogModel
from aim.storage.structured.sql_engine.models import Run as RunModel
from aim.storage.structured.sql_engine.models import RunInfo as RunInfoModel
from aim.storage.structured.sql_engine.models import Tag as TagModel
from aim.storage.structured.sql_engine.utils import (
    ModelMappedClassMeta,
    ModelMappedCollection,
)
from aim.storage.structured.sql_engine.utils import ModelMappedProperty as Property
from aim.storage.types import SafeNone
from sqlalchemy import __version__ as sa_version
from sqlalchemy import delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload


logger = logging.getLogger(__name__)


def session_commit_or_flush(session):
    if getattr(session, 'autocommit', True) and sa_version >= '2.0.0':
        session.commit()
    else:
        session.flush()


def timestamp_or_none(dt):
    if dt is None:
        return None
    if not dt.tzinfo:
        dt = dt.replace(tzinfo=pytz.utc)
    return dt.timestamp()


class ModelMappedRun(IRun, metaclass=ModelMappedClassMeta):
    __model__ = RunModel
    __mapped_properties__ = [
        Property('name'),
        Property('description'),
        Property('archived', 'is_archived'),
        Property('created_at', with_setter=False),
        Property('creation_time', 'created_at', get_modifier=timestamp_or_none, with_setter=False),
        Property('finalized_at'),
        Property('end_time', 'finalized_at', get_modifier=timestamp_or_none, with_setter=False),
        Property('updated_at', with_setter=False),
        Property('hash', with_setter=False),
        Property('experiment', autogenerate=False),
        Property('tags', autogenerate=False),
        Property('notes', autogenerate=False),
        Property('info', autogenerate=False),
    ]

    def __init__(self, model: RunModel, session):
        self._model = model
        self._id = model.id
        self._session = session

    def __repr__(self) -> str:
        return f"<ModelMappedRun id={self.hash}, name='{self.name}'>"

    @classmethod
    def from_model(cls, model_obj, session) -> 'ModelMappedRun':
        return ModelMappedRun(model_obj, session)

    @classmethod
    def from_hash(cls, runhash: str, created_at, session) -> 'ModelMappedRun':
        if session.query(RunModel).filter(RunModel.hash == runhash).scalar():
            raise ValueError(f"Run with hash '{runhash}' already exists.")
        run = RunModel(runhash, created_at)
        session.add(run)
        session_commit_or_flush(session)
        return ModelMappedRun(run, session)

    @classmethod
    def delete_run(cls, runhash: str, session) -> bool:
        try:
            rows_affected = session.query(RunModel).filter(RunModel.hash == runhash).delete()
            session_commit_or_flush(session)
        except Exception:
            return False
        return rows_affected > 0

    @classmethod
    def find(cls, _id: str, **kwargs) -> Union[IRun, SafeNone]:
        session = kwargs.get('session')
        if not session:
            return SafeNone()
        model_obj = (
            session.query(RunModel)
            .options(
                [
                    joinedload(RunModel.experiment),
                    joinedload(RunModel.tags),
                ]
            )
            .filter(RunModel.hash == _id)
            .first()
        )
        if model_obj:
            return ModelMappedRun.from_model(model_obj, session)
        return SafeNone()

    @classmethod
    def find_many(cls, ids: List[str], **kwargs) -> List[IRun]:
        session = kwargs.get('session')
        if not session:
            return []
        q = session.query(RunModel).filter(RunModel.hash.in_(ids))

        return ModelMappedRunCollection(session, query=q)

    @classmethod
    def all(cls, **kwargs) -> Collection[IRun]:
        session = kwargs.get('session')
        if not session:
            return []
        q = (
            session.query(RunModel)
            .options(
                [
                    joinedload(RunModel.experiment),
                    joinedload(RunModel.tags),
                ]
            )
            .order_by(RunModel.created_at.desc())
        )
        return ModelMappedRunCollection(session, query=q)

    @classmethod
    def search(cls, term: str, **kwargs) -> Collection[IRun]:
        session = kwargs.get('session')
        if not session:
            return []
        term = f'%{term}%'
        q = (
            session.query(RunModel)
            .options(
                [
                    joinedload(RunModel.experiment),
                    joinedload(RunModel.tags),
                ]
            )
            .filter(RunModel.name.like(term))
        )
        return ModelMappedRunCollection(session, query=q)

    @property
    def experiment_obj(self) -> Optional[IExperiment]:
        if self._model and self._model.experiment:
            return ModelMappedExperiment(self._model.experiment, self._session)
        else:
            return None

    @property
    def experiment(self) -> Union[str, SafeNone]:
        return self.experiment_obj.name if self.experiment_obj else SafeNone()

    @property
    def info(self) -> Optional[IRunInfo]:
        session = self._session
        if self._model:
            if self._model.info:
                return ModelMappedRunInfo(self._model.info, session)
            else:
                info = RunInfoModel()

                self._model.info = info
                session.add(info)
                session.add(self._model)
                session_commit_or_flush(session)

                return ModelMappedRunInfo(self._model.info, session)

    @experiment.setter
    def experiment(self, value: str):
        def unsafe_set_exp():
            if value is None:
                exp = None
            else:
                exp = session.query(ExperimentModel).filter(ExperimentModel.name == value).first()
                if not exp:
                    exp = ExperimentModel(value)
                    session.add(exp)
            self._model.experiment = exp
            session.add(self._model)

        session = self._session
        unsafe_set_exp()
        try:
            session_commit_or_flush(session)
        except IntegrityError:
            session.rollback()
            unsafe_set_exp()
            session.flush()

    @property
    def tags_obj(self) -> TagCollection:
        if self._model:
            return ModelMappedTagCollection(
                self._session, collection=[t for t in self._model.tags if t.is_archived is not True]
            )
        else:
            return []

    @property
    def tags(self) -> List[str]:
        return [tag.name for tag in self.tags_obj]

    def add_tag(self, value: str) -> None:
        def unsafe_add_tag():
            if value is None:
                tag = None
            else:
                tag = session.query(TagModel).filter(TagModel.name == value).first()
                if not tag:
                    tag = TagModel(value)
                    session.add(tag)
            self._model.tags.append(tag)
            session.add(self._model)

        if value in self.tags:
            logger.warning(f'Tag with value: {value} is already present in this run.')
            return

        session = self._session
        unsafe_add_tag()
        try:
            session_commit_or_flush(session)
        except IntegrityError:
            session.rollback()
            unsafe_add_tag()
            session_commit_or_flush(session)

    def remove_tag(self, tag_name: str) -> bool:
        session = self._session
        tag_removed = False
        for tag in self._model.tags:
            if tag.name == tag_name:
                self._model.tags.remove(tag)
                tag_removed = True
                break
        session.add(self._model)
        session_commit_or_flush(session)
        return tag_removed

    @property
    def notes_obj(self) -> NoteCollection:
        if self._model:
            return ModelMappedNoteCollection(self._session, collection=[n for n in self._model.notes])
        else:
            return []

    @property
    def notes(self) -> List[dict]:
        session = self._session

        qs = (
            session.query(NoteModel)
            .filter(
                NoteModel.run_id == self._model.id,
            )
            .order_by(NoteModel.updated_at.desc())
        )

        return [
            {'id': note.id, 'content': note.content, 'created_at': note.created_at, 'updated_at': note.updated_at}
            for note in qs
        ]

    def find_note(self, _id: int):
        session = self._session

        qs = session.query(NoteModel).filter(NoteModel.run_id == self._model.id, NoteModel.id == _id)
        return qs.first()

    def add_note(self, content: str):
        session = self._session

        note = NoteModel(content)
        session.add(note)
        self._model.notes.append(note)
        session.flush()

        audit_log = NoteAuditLogModel(action='Created', before=None, after=content)
        audit_log.note_id = note.id
        session.add(audit_log)

        session.add(self._model)
        session_commit_or_flush(session)

        return note

    def update_note(self, _id: int, content):
        session = self._session

        note = self.find_note(_id=_id)

        before = note.content
        note.content = content

        audit_log = NoteAuditLogModel(action='Updated', before=before, after=content)
        audit_log.note_id = _id
        session.add(audit_log)

        session.add(note)

        session_commit_or_flush(session)

        return note

    def remove_note(self, _id: int):
        session = self._session

        audit_log = NoteAuditLogModel(action='Deleted', before=None, after=None)
        audit_log.note_id = _id
        session.add(audit_log)

        delete_stmnt = delete(NoteModel).where(
            NoteModel.run_id == self._model.id,
            NoteModel.id == _id,
        )
        session.execute(delete_stmnt)

        session_commit_or_flush(session)


class ModelMappedExperiment(IExperiment, metaclass=ModelMappedClassMeta):
    __model__ = ExperimentModel
    __mapped_properties__ = [
        Property('name'),
        Property('description'),
        Property('uuid', with_setter=False),
        Property('archived', 'is_archived'),
        Property('created_at', with_setter=False),
        Property('creation_time', 'created_at', get_modifier=timestamp_or_none, with_setter=False),
        Property('updated_at', with_setter=False),
        Property('notes', autogenerate=False),
    ]

    def __init__(self, model_inst: ExperimentModel, session):
        self._model = model_inst
        self._id = model_inst.id
        self._session = session

    def __repr__(self) -> str:
        return f"<ModelMappedExperiment id={self.uuid}, name='{self.name}'>"

    def __eq__(self, other) -> bool:
        if isinstance(other, str):
            return self._model.name == other
        elif isinstance(other, ModelMappedExperiment):
            return self._model.id == other._model.id
        return False

    @classmethod
    def from_model(cls, model_obj, session) -> 'ModelMappedExperiment':
        return ModelMappedExperiment(model_obj, session)

    @classmethod
    def from_name(cls, name: str, session) -> 'ModelMappedExperiment':
        if session.query(ExperimentModel).filter(ExperimentModel.name == name).scalar():
            raise ValueError(f"Experiment with name '{name}' already exists.")
        exp = ExperimentModel(name)
        session.add(exp)
        session_commit_or_flush(session)
        return ModelMappedExperiment(exp, session)

    @property
    def runs(self) -> RunCollection:
        return ModelMappedRunCollection(self._session, collection=self._model.runs)

    def get_runs(self) -> RunCollection:
        return self.runs

    @classmethod
    def find(cls, _id: str, **kwargs) -> Union[IExperiment, SafeNone]:
        session = kwargs.get('session')
        if not session:
            return SafeNone()
        model_obj = (
            session.query(ExperimentModel)
            .options(
                [
                    joinedload(ExperimentModel.runs),
                ]
            )
            .filter(ExperimentModel.uuid == _id)
            .first()
        )
        if model_obj:
            return ModelMappedExperiment(model_obj, session)
        return SafeNone()

    @classmethod
    def all(cls, **kwargs) -> Collection[IExperiment]:
        session = kwargs.get('session')
        if not session:
            return []
        q = session.query(ExperimentModel).options(
            [
                joinedload(ExperimentModel.runs),
            ]
        )
        return ModelMappedExperimentCollection(session, query=q)

    @classmethod
    def delete_experiment(cls, _id: str, **kwargs) -> bool:
        session = kwargs.get('session')
        if not session:
            return False
        try:
            exp = session.query(ExperimentModel).filter(ExperimentModel.uuid == _id).first()
            # delete all runs and notes and experiment
            session.query(RunModel).filter(RunModel.experiment_id == exp.id).delete()
            session.query(NoteModel).filter(NoteModel.experiment_id == exp.id).delete()
            rows_affected = session.query(ExperimentModel).filter(ExperimentModel.uuid == _id).delete()
            session_commit_or_flush(session)
        except Exception:
            return False
        return rows_affected > 0

    @classmethod
    def search(cls, term: str, **kwargs) -> Collection[IExperiment]:
        session = kwargs.get('session')
        if not session:
            return []
        term = f'%{term}%'
        q = (
            session.query(ExperimentModel)
            .options(
                [
                    joinedload(ExperimentModel.runs),
                ]
            )
            .filter(ExperimentModel.name.like(term))
        )
        return ModelMappedExperimentCollection(session, query=q)

    @property
    def notes(self) -> List[dict]:
        session = self._session

        qs = (
            session.query(NoteModel)
            .filter(
                NoteModel.experiment_id == self._model.id,
            )
            .order_by(NoteModel.updated_at.desc())
        )

        return [
            {'id': note.id, 'content': note.content, 'created_at': note.created_at, 'updated_at': note.updated_at}
            for note in qs
        ]

    def find_note(self, _id: int):
        session = self._session

        qs = session.query(NoteModel).filter(NoteModel.experiment_id == self._model.id, NoteModel.id == _id)
        return qs.first()

    def add_note(self, content: str):
        session = self._session

        note = NoteModel(content)
        session.add(note)
        self._model.notes.append(note)
        session.flush()

        audit_log = NoteAuditLogModel(action='Created', before=None, after=content)
        audit_log.note_id = note.id
        session.add(audit_log)

        session.add(self._model)
        session_commit_or_flush(session)

        return note

    def update_note(self, _id: int, content):
        session = self._session

        note = self.find_note(_id=_id)

        before = note.content
        note.content = content

        audit_log = NoteAuditLogModel(action='Updated', before=before, after=content)
        audit_log.note_id = note.id
        session.add(audit_log)

        session.add(note)
        session_commit_or_flush(session)

        return note

    def remove_note(self, _id: int):
        session = self._session

        audit_log = NoteAuditLogModel(action='Deleted', before=None, after=None)
        audit_log.note_id = _id
        session.add(audit_log)

        delete_stmnt = delete(NoteModel).where(
            NoteModel.experiment_id == self._model.id,
            NoteModel.id == _id,
        )
        session.execute(delete_stmnt)
        session_commit_or_flush(session)

    def refresh_model(self):
        self._session.refresh(self._model)


class ModelMappedTag(ITag, metaclass=ModelMappedClassMeta):
    __model__ = TagModel
    __mapped_properties__ = [
        Property('name'),
        Property('color'),
        Property('description'),
        Property('archived', 'is_archived'),
        Property('uuid', with_setter=False),
        Property('created_at', with_setter=False),
        Property('updated_at', with_setter=False),
    ]

    def __init__(self, model_inst: TagModel, session):
        self._model = model_inst
        self._id = model_inst.id
        self._session = session

    def __repr__(self) -> str:
        return f"<ModelMappedTag id={self.uuid}, name='{self.name}'>"

    def __eq__(self, other) -> bool:
        if isinstance(other, str):
            return self._model.name == other
        elif isinstance(other, ModelMappedTag):
            return self._model.id == other._model.id
        return False

    @classmethod
    def from_model(cls, model_obj, session) -> 'ModelMappedTag':
        return ModelMappedTag(model_obj, session)

    @classmethod
    def from_name(cls, name: str, session) -> 'ModelMappedTag':
        if session.query(TagModel).filter(TagModel.name == name).scalar():
            raise ValueError(f"Tag with name '{name}' already exists.")
        tag = TagModel(name)
        session.add(tag)
        session_commit_or_flush(session)
        return ModelMappedTag(tag, session)

    @classmethod
    def find(cls, _id: str, **kwargs) -> Union[ITag, SafeNone]:
        session = kwargs.get('session')
        if not session:
            return SafeNone()
        model_obj = (
            session.query(TagModel)
            .options(
                [
                    joinedload(TagModel.runs),
                ]
            )
            .filter(TagModel.uuid == _id)
            .first()
        )
        if model_obj:
            return ModelMappedTag(model_obj, session)
        return SafeNone()

    @classmethod
    def all(cls, **kwargs) -> Collection[ITag]:
        session = kwargs.get('session')
        if not session:
            return []
        q = session.query(TagModel).options(
            [
                joinedload(TagModel.runs),
            ]
        )
        return ModelMappedTagCollection(session, query=q)

    @classmethod
    def search(cls, term: str, **kwargs) -> Collection[ITag]:
        session = kwargs.get('session')
        if not session:
            return []
        term = f'%{term}%'
        q = (
            session.query(TagModel)
            .options(
                [
                    joinedload(TagModel.runs),
                ]
            )
            .filter(TagModel.name.like(term))
        )
        return ModelMappedTagCollection(session, query=q)

    @classmethod
    def delete(cls, _id: str, **kwargs) -> bool:
        session = kwargs.get('session')
        if not session:
            return False
        model_obj = session.query(TagModel).filter(TagModel.uuid == _id).first()
        if model_obj:
            session.delete(model_obj)
            session_commit_or_flush(session)
            return True
        return False

    @property
    def runs(self) -> RunCollection:
        return ModelMappedRunCollection(self._session, collection=self._model.runs)

    def get_runs(self) -> RunCollection:
        return self.runs


class ModelMappedNote(INote, metaclass=ModelMappedClassMeta):
    __model__ = NoteModel
    __mapped_properties__ = [
        Property('id', with_setter=False),
        Property('content'),
        Property('run', with_setter=False),
        Property('created_at', with_setter=False),
        Property('updated_at', with_setter=False),
    ]

    def __init__(self, model_inst: NoteModel, session):
        self._model = model_inst
        self._id = model_inst.id
        self._session = session

    def __repr__(self) -> str:
        return f'<ModelMappedNote id={self._id}>'

    @classmethod
    def from_model(cls, model_obj, session) -> 'ModelMappedNote':
        return ModelMappedNote(model_obj, session)

    @classmethod
    def find(cls, _id: str, **kwargs) -> Union[INote, SafeNone]:
        session = kwargs.get('session')
        if not session:
            return SafeNone()
        model_obj = (
            session.query(NoteModel)
            .options(
                [
                    joinedload(NoteModel.run),
                ]
            )
            .filter(NoteModel.id == _id)
            .first()
        )
        if model_obj:
            return ModelMappedNote(model_obj, session)
        return SafeNone()

    @classmethod
    def all(cls, **kwargs) -> Collection[INote]:
        session = kwargs.get('session')
        if not session:
            return []
        q = (
            session.query(NoteModel)
            .options(
                [
                    joinedload(NoteModel.run),
                ]
            )
            .order_by(NoteModel.updated_at.desc())
        )
        return ModelMappedTagCollection(session, query=q)

    @classmethod
    def search(cls, term: str, **kwargs) -> Collection[INote]:
        raise NotImplementedError

    @classmethod
    def delete(cls, _id: str, **kwargs) -> bool:
        session = kwargs.get('session')
        if not session:
            return False
        model_obj = session.query(NoteModel).filter(NoteModel.id == _id).first()
        if model_obj:
            session.delete(model_obj)
            session_commit_or_flush(session)
            return True
        return False


class ModelMappedRunInfo(IRunInfo, metaclass=ModelMappedClassMeta):
    __model__ = RunInfoModel
    __mapped_properties__ = [
        Property('created_at', with_setter=False),
        Property('updated_at', with_setter=False),
        Property('last_notification_index'),
    ]

    def __init__(self, model_inst: RunInfoModel, session):
        self._model = model_inst
        self._id = model_inst.id
        self._session = session

    def __repr__(self) -> str:
        return f'<ModelMappedRunInfo id={self._id}>'


ModelMappedRunCollection = ModelMappedCollection[ModelMappedRun]
ModelMappedExperimentCollection = ModelMappedCollection[ModelMappedExperiment]
ModelMappedTagCollection = ModelMappedCollection[ModelMappedTag]
ModelMappedNoteCollection = ModelMappedCollection[ModelMappedNote]
