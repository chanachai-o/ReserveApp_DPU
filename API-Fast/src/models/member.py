from sqlalchemy import Column, String, Integer, Boolean
from ..config.database import Base
from sqlalchemy.orm import relationship

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    password = Column(String, nullable=False)
    role = Column(String, default="customer")  # customer, staff, admin
    is_active = Column(Boolean, default=True)