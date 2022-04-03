from fastapi import HTTPException, Depends
from starlette import status
from starlette.responses import Response

from aim.web.api.runs.note.pydnamic_models import NoteIn
from aim.web.api.utils import APIRouter, object_factory

note_router = APIRouter()

NOTE_EXITS = 'Note with name {name} already exists.'
NOTE_NOT_FOUND = 'Note with id {id} is not found in this run.'


@note_router.get('/{run_id}/note/')
def list_note_api(run_id, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        notes = run.notes

    return notes


@note_router.post('/{run_id}/note/', status_code=status.HTTP_201_CREATED)
def create_note_api(run_id, note_in: NoteIn, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        note_name = note_in.name.strip()

        note = run.find_note(name=note_name)
        if note:
            raise HTTPException(status_code=400, detail=NOTE_EXITS.format(name=note_name))

        note_content = note_in.content.strip()
        run.add_note(note_name, note_content)
        note = run.find_note(name=note_name)

    return {
        'id': note.id,
        'name': note.name,
        'created_at': note.created_at,
    }


@note_router.get('/{run_id}/note/{_id}')
def get_note_api(run_id, _id: int, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        note = run.find_note(_id=_id)
        if not note:
            raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND.format(id=_id))

    return {
        'id': note.id,
        'name': note.name,
        'content': note.content,
    }


@note_router.put('/{run_id}/note/{_id}')
def update_note_api(run_id, _id: int, note_in: NoteIn, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        note = run.find_note(_id=_id)
        if not note:
            raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND.format(id=_id))

        content = note_in.content.strip()
        name = note_in.name.strip()

        existing_note = run.find_note(name=name)
        if existing_note and existing_note.id != note.id:
            raise HTTPException(status_code=400, detail=NOTE_EXITS.format(name=name))

        run.update_note(_id=_id, name=name, content=content)
        updated_note = run.find_note(_id=_id)

    return {
        'id': updated_note.id,
        'name': updated_note.name,
        'content': updated_note.content,
    }


@note_router.delete('/{run_id}/note/{_id}')
def delete_note_api(run_id, _id: int, factory=Depends(object_factory)):
    with factory:
        run = factory.find_run(run_id)
        if not run:
            raise HTTPException(status_code=404)

        note = run.find_note(_id=_id)
        if not note:
            raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND.format(id=_id))

        run.remove_note(_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
