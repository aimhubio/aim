from pydantic import BaseModel
from typing import List


class BoardOut(BaseModel):
    path: str
    code: str


BoardListOut = List[str]
