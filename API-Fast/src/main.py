from fastapi import FastAPI
from .config.database import engine
from .models.member import Base
import os
from fastapi.staticfiles import StaticFiles
import logging
from .routes import member_routes,auth_routes,file_upload_router,inventory_lot_router
from .routes.equipment_routes import router as equipment_router
from .routes.project_routes import router as project_router
from .routes.project_member_routes import router as pm_router
from .routes.project_equipment_routes import router as pe_router
from .routes.borrow_routes import router as borrow_router
from .routes.inventory_lot_router import router as inventory_lot_router
from .routes.equipment_category_router import router as equipment_category_router
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
app.include_router(member_routes.router, prefix="/members", tags=["Members"])
app.include_router(equipment_router, prefix="/equipments", tags=["Equipments"])
app.include_router(inventory_lot_router, prefix="/inventory-lots", tags=["InventoryLots"])
app.include_router(equipment_category_router, prefix="/equipment-categories", tags=["EquipmentsCategories"])
app.include_router(project_router, prefix="/projects", tags=["Projects"])
app.include_router(pm_router, prefix="/project-members", tags=["ProjectMembers"])
app.include_router(pe_router, prefix="/project-equipments", tags=["ProjectEquipments"])
app.include_router(borrow_router, prefix="/borrow-transactions", tags=["BorrowTransactions"])
app.include_router(file_upload_router.router, prefix="/api", tags=["File Upload"])
@app.get("/")
async def root():
    logging.debug("This is a debug message")
    return {"message": "Welcome to the API"}