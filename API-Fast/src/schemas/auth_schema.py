from pydantic import BaseModel

from ..schemas.member_schema import UserCreate


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    member: UserCreate
    access_token: str
    token_type: str
