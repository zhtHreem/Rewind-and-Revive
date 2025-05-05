from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from model_utils import load_data_from_mongo, chat_with_bot
import os
import shutil
import uuid
from fastapi.responses import JSONResponse
import traceback
# Init app
app = FastAPI()

# Allow frontend requests (adjust origin in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load products from MongoDB at startup
print("🚀 Loading products from MongoDB...")
load_data_from_mongo()
print("✅ Products loaded.")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/chat")
async def chat(
    user_query: str = Form(...),
    image: UploadFile = File(None)
):
    print("📩 Incoming request")
    print("👉 user_query:", user_query)
    image_path = None

    if image:
        try:
            filename = f"{uuid.uuid4()}_{image.filename}"
            image_path = os.path.join(UPLOAD_FOLDER, filename)
            with open(image_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            print(f"🖼️ Image saved at: {image_path}")
        except Exception as e:
            print("❌ Error saving image:")
            traceback.print_exc()
            return JSONResponse(status_code=500, content={"error": str(e)})

    try:
        print("🚀 Calling chat_with_bot...")
        result = chat_with_bot(user_query, image_path)
        print("✅ Response from chat_with_bot:", result)
        return result
    except Exception as e:
        print("❌ Exception inside chat_with_bot:")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        if image_path and os.path.exists(image_path):
            os.remove(image_path)
            print(f"🧹 Temp image deleted: {image_path}")
