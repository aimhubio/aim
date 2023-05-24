from pydantic import BaseModel
from typing import Optional, List


class BoardTemplateBase(BaseModel):
    template_id: str
    name: str
    description: str
    package: str
    version: str


class BoardTemplateOut(BoardTemplateBase):
    code: str


BoardTemplateListOut = List[BoardTemplateBase]


class BoardBase(BaseModel):
    board_id: str
    name: str
    description: str
    template_id: Optional[str] = None


class BoardOut(BoardBase):
    code: str
    is_from_template: bool
    is_archived: bool


BoardListOut = List[BoardBase]


class CreateBoardIn(BaseModel):
    name: str
    description: Optional[str] = None
    from_template: Optional[str] = None
    code: Optional[str] = None


class UpdateBoardIn(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    code: Optional[str] = None
