import google.generativeai as genai
import numpy as np
from pymongo import MongoClient
from bson.objectid import ObjectId
from PIL import Image
import io
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

# Setup Gemini
load_dotenv()  # Load variables from .env

# Setup Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Setup MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client["RewindAndRevive"]
collection = db["products"]


# Globals
conversation_history = []
vectorizer = None
tfidf_matrix = None
products_data = []

def load_data_from_mongo():
    global products_data, vectorizer, tfidf_matrix

    # Fetch all product documents
    products = list(collection.find())
    if not products:
        raise Exception("❌ No products found in MongoDB.")

    products_data = products

    # Prepare text data for TF-IDF
    texts = []
    for doc in products:
        combined = ' '.join([str(doc.get(field, '')) for field in ['name', 'description', 'category', 'color', 'material', 'type']])
        texts.append(combined)

    vectorizer = TfidfVectorizer(max_features=300)
    tfidf_matrix = vectorizer.fit_transform(texts)

    print(f"Loaded {len(products)} products from MongoDB (text only mode).")

def chat_with_bot(user_query, image_path=None):
    global conversation_history

    # Step 1: TF-IDF similarity
    query_vector = vectorizer.transform([user_query])
    similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
    top_indices = similarities.argsort()[-20:][::-1]

    # Step 2: Smart keyword-to-type mapping
    keyword_to_type = {
        # Bottoms
        "pants": "bottom", "trousers": "bottom", "jeans": "bottom", "bottom": "bottom", "shorts": "bottom",
        "skirt": "bottom", "culottes": "bottom", "capris": "bottom", "leggings": "bottom", "palazzos": "bottom",
        "joggers": "bottom", "slacks": "bottom", "denims": "bottom",

        # Tops
        "shirt": "top", "tshirt": "top", "t-shirt": "top", "tee": "top", "top": "top", "blouse": "top",
        "crop top": "top", "tank": "top", "tanktop": "top", "camisole": "top", "kurta": "top", "sweater": "top",
        "hoodie": "top", "sweatshirt": "top", "polo": "top", "bodysuit": "top", "frock": "top", "dress": "top",

        # Layering pieces
        "jacket": "layer", "blazer": "layer", "coat": "layer", "shrug": "layer", "cardigan": "layer",
        "overcoat": "layer", "trench": "layer", "waistcoat": "layer",

        # Footwear
        "shoes": "footwear", "boots": "footwear", "heels": "footwear", "sneakers": "footwear",
        "loafers": "footwear", "sandals": "footwear", "slippers": "footwear", "mules": "footwear", "flats": "footwear",

        # Accessories
        "scarf": "accessory", "hat": "accessory", "belt": "accessory", "watch": "accessory",
        "bracelet": "accessory", "necklace": "accessory", "bag": "accessory", "handbag": "accessory",
        "clutch": "accessory", "sunglasses": "accessory", "glasses": "accessory", "earrings": "accessory",
        "ring": "accessory"
    }

    query_lower = user_query.lower()
    detected_type = None
    for keyword, mapped_type in keyword_to_type.items():
        if keyword in query_lower:
            detected_type = mapped_type
            break

    # If image is provided, try to detect clothing type from image using Gemini
    if image_path and not detected_type:
        try:
            with open(image_path, "rb") as f:
                image_bytes = f.read()

            # Use Gemini to detect clothing type from image
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content([
                {"mime_type": "image/jpeg", "data": image_bytes},
                {"text": "Is this image showing primarily a top (shirt, t-shirt, blouse, etc.) or a bottom (jeans, skirt, pants, etc.)? Answer with only one word: 'top' or 'bottom'."}
            ])

            if "top" in response.text.lower():
                detected_type = "top"
            elif "bottom" in response.text.lower():
                detected_type = "bottom"
        except Exception as e:
            print(f"❌ Error analyzing image: {e}")

    print(f" Detected clothing type: {detected_type}")

    # Step 3: Complementary recommendation logic
    recommended_type = None
    if detected_type == "top":
        recommended_type = "bottom"
        print(" Recommending bottoms (jeans/skirts) to match the top")
    elif detected_type == "bottom":
        recommended_type = "top"
        print(" Recommending tops to match the bottom")
    else:
        recommended_type = None
        print(" No specific clothing type detected, using general recommendations")

    def contains_keyword_in_fields(p, target_type):
        name = p.get("name", "").lower()
        desc = p.get("description", "").lower()
        p_type = p.get("type", "").lower()

        if target_type == "bottom":
            return any(k in name or k in desc or k in p_type for k in ["jeans", "skirt", "pants", "bottom", "trousers"])
        if target_type == "top":
            return any(k in name or k in desc or k in p_type for k in ["shirt", "top", "blouse", "tee", "t-shirt"])
        return False

    if recommended_type:
        filtered = [
            products_data[i] for i in top_indices
            if contains_keyword_in_fields(products_data[i], recommended_type)
        ]
    else:
        filtered = [products_data[i] for i in top_indices]

    recommended = filtered[:3] if filtered else [products_data[i] for i in top_indices[:3]]

    # Step 5: Gemini reply
    try:
        chat = genai.GenerativeModel("gemini-2.0-flash").start_chat(history=conversation_history)

        if image_path and 'image_bytes' in locals():
            prompt_text = f"{user_query}. "
            if detected_type == "top":
                prompt_text += "I see you're looking at a top. Here are some jeans and skirts that would pair well with it."
            elif detected_type == "bottom":
                prompt_text += "I see you're looking at bottoms. Here are some tops that would pair well with them."
            else:
                prompt_text += "Reply with a one-line fashion suggestion based on this image."

            response = chat.send_message([
                {"mime_type": "image/jpeg", "data": image_bytes},
                {"text": prompt_text}
            ])
        else:
            prompt_text = f"{user_query}. "
            if detected_type == "top":
                prompt_text += "I see you're interested in a top. Here are some jeans and skirts that would pair well with it. Reply with a single sentence fashion suggestion. No elaboration."
            elif detected_type == "bottom":
                prompt_text += "I see you're interested in bottoms. Here are some tops that would pair well with them. Reply with a single sentence fashion suggestion. No elaboration."
            else:
                prompt_text += "Reply with a single sentence fashion suggestion. No elaboration."

            response = chat.send_message(prompt_text)

        bot_reply = response.text.strip()
        bot_reply = bot_reply.split('\n')[0].split('. ')[0].strip() + '.'  # Enforce one-liner

        print(" Suggestion:", bot_reply)

    except Exception as e:
        print(f"❌ Error generating reply: {e}")
        bot_reply = "Sorry, I had trouble generating a fashion suggestion."

    # Step 6: Update history
    conversation_history.append({"role": "user", "parts": [{"text": user_query}]})
    conversation_history.append({"role": "model", "parts": [{"text": bot_reply}]})

    # Step 7: Format products
    def format_product(p):
        return {
            "name": p.get("name"),
            "description": p.get("description"),
            "price": p.get("price"),
            "color": p.get("color"),
            "image": p.get("images", [""])[0] if isinstance(p.get("images"), list) else "",
            "product_link": f"http://localhost:3000/product/{str(p['_id'])}"
        }

    return {
        "reply": bot_reply,
        "products": [format_product(p) for p in recommended]
    }
