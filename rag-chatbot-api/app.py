from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from model_utils import setup_bot
import os
import shutil
import uuid

# Init app
app = FastAPI()

# Allow frontend requests (if frontend is running on localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up chatbot
chat_with_bot = setup_bot("products.xlsx")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/chat")
async def chat(
    user_query: str = Form(...),
    image: UploadFile = File(None)
):
    image_path = None

    if image:
        filename = f"{uuid.uuid4()}_{image.filename}"
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

    result = chat_with_bot(user_query, image_path)
    
    # 👇 Add this log to verify what's being sent to frontend
    print("🧪 Backend result to frontend:", result)

    return result


