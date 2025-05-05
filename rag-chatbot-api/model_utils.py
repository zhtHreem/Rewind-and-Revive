import os
import google.generativeai as genai
import numpy as np
from pymongo import MongoClient
from bson.objectid import ObjectId
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Setup Gemini
genai.configure(api_key="AIzaSyA-MGyfJ3lmiXS-iqfeYFNrBll6lw9YtOU")

# MongoDB setup
client = MongoClient("mongodb+srv://admin:123@eventify.dkeujvr.mongodb.net/RewindAndRevive?retryWrites=true&w=majority")
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

    print(f"✅ Loaded {len(products)} products from MongoDB (text only mode).")

def chat_with_bot(user_query, image_path=None):
    global conversation_history

    # Step 1: TF-IDF similarity
    query_vector = vectorizer.transform([user_query])
    similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
    top_indices = similarities.argsort()[-10:][::-1]  # increase pool for better filtering

    # Step 2: Smart keyword-to-type mapping
    keyword_to_type = {
    # Bottoms
    "pants": "bottom", "trousers": "bottom", "jeans": "bottom", "bottom": "bottom", "shorts": "bottom",
    "skirt": "bottom", "culottes": "bottom", "capris": "bottom", "leggings": "bottom", "palazzos": "bottom",
    "joggers": "bottom", "slacks": "bottom", "denims": "bottom",

    # Tops
    "shirt": "top", "tshirt": "top", "t-shirt": "top", "tee": "top", "top": "top", "blouse": "top", "crop top": "top",
    "tank": "top", "tanktop": "top", "camisole": "top", "kurta": "top", "sweater": "top", "hoodie": "top",
    "sweatshirt": "top", "polo": "top", "bodysuit": "top",

    # Layering pieces
    "jacket": "layer", "blazer": "layer", "coat": "layer", "shrug": "layer", "cardigan": "layer",
    "overcoat": "layer", "trench": "layer", "waistcoat": "layer",

    # Footwear
    "shoes": "footwear", "boots": "footwear", "heels": "footwear", "sneakers": "footwear",
    "loafers": "footwear", "sandals": "footwear", "slippers": "footwear", "mules": "footwear", "flats": "footwear",

    # Accessories
    "scarf": "accessory", "hat": "accessory", "belt": "accessory", "watch": "accessory",
    "bracelet": "accessory", "necklace": "accessory", "bag": "accessory", "handbag": "accessory", "clutch": "accessory",
    "sunglasses": "accessory", "glasses": "accessory", "earrings": "accessory", "ring": "accessory"
}


    query_lower = user_query.lower()
    exclude_type = None
    for keyword, mapped_type in keyword_to_type.items():
        if keyword in query_lower:
            exclude_type = mapped_type
            break

    print(f"🕵️ Excluding type: {exclude_type}")

    # Step 3: Filter logic
    def normalize_type(p):
        return p.get("type", "").lower().strip()

    def contains_keyword_in_name(p):
        name = p.get("name", "").lower()
        return any(k in name for k in keyword_to_type if keyword_to_type[k] == exclude_type)

    filtered = [
        products_data[i] for i in top_indices
        if normalize_type(products_data[i]) != exclude_type and not contains_keyword_in_name(products_data[i])
    ]

    recommended = filtered[:3] if filtered else [products_data[i] for i in top_indices[:3]]

    # Step 4: Gemini reply
    chat = genai.GenerativeModel("gemini-1.5-pro").start_chat(history=conversation_history)
    response = chat.send_message(f"{user_query}. Reply with a one-line fashion suggestion only.")
    bot_reply = response.text.strip()

    print("🧠 Suggestion:", bot_reply)

    # Step 5: Update history
    conversation_history.append({ "role": "user", "parts": [{"text": user_query}] })
    conversation_history.append({ "role": "model", "parts": [{"text": bot_reply}] })

    # Step 6: Format products
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
