from pydantic import BaseModel
from typing import Optional, List


class BoardOut(BaseModel):
    path: str
    code: str


BoardListOut = List[str]
