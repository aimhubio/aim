from pydantic import BaseModel


class NoteIn(BaseModel):
    name: str
    content: str
