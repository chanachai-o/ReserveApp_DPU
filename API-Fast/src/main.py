from fastapi import FastAPI
from .config.database import engine
from .models.member import Base
import os
from fastapi.staticfiles import StaticFiles
import logging
from .routes import member_routes,auth_routes,file_upload_router

from fastapi.middleware.cors import CORSMiddleware
logging.basicConfig(level=logging.DEBUG)
app = FastAPI()
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200","http://localhost:4201","https://61a8-49-228-101-141.ngrok-free.app"],  # Allow specific origin
    allow_credentials=True,  # Allow cookies and authorization headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)
# สร้างตารางทั้งหมดในฐานข้อมูลเมื่อแอปเริ่มทำงาน
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
# โฟลเดอร์สำหรับเก็บไฟล์รูปภาพ
UPLOAD_DIR = "./uploaded_images"

# ตรวจสอบว่ามีโฟลเดอร์หรือไม่ ถ้าไม่มีให้สร้าง
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# เส้นทางสำหรับให้บริการไฟล์แบบ static (เช่น รูปภาพ)
app.mount("/images", StaticFiles(directory=UPLOAD_DIR), name="images")
# รวม routes
app.include_router(auth_routes.router, prefix="/auth", tags=["Authentication"])
app.include_router(file_upload_router.router, prefix="/api", tags=["File Upload"])
app.include_router(member_routes.router, prefix="/members", tags=["Members"])

@app.get("/")
async def root():
    logging.debug("This is a debug message")
    return {"message": "Welcome to the API"}