import pandas as pd
import google.generativeai as genai
from PIL import Image
import os
import faiss
import numpy as np
import clip
import torch
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests
from io import BytesIO

# Set up Gemini API Key
genai.configure(api_key="AIzaSyA-MGyfJ3lmiXS-iqfeYFNrBll6lw9YtOU")  # Replace this with env variable in production

# Globals to be filled during setup
model = None
preprocess = None
vectorizer = None
tfidf_matrix = None
image_embeddings = None
index = None
df = None
valid_indices = []

conversation_history = []
retrieved_context_memory = []

device = "cuda" if torch.cuda.is_available() else "cpu"

def encode_image(image_path):
    try:
        if image_path.startswith("http://") or image_path.startswith("https://"):
            response = requests.get(image_path, timeout=10)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
        elif os.path.exists(image_path):
            image = Image.open(image_path)
        else:
            return None

        image = preprocess(image).unsqueeze(0).to(device)
        with torch.no_grad():
            image_features = model.encode_image(image)
        return image_features.cpu().numpy().flatten()
    except Exception as e:
        print(f"❌ Error processing image {image_path}: {e}")
        return None

def detect_type_from_text(text):
    text = text.lower()
    if any(word in text for word in ["shirt", "top", "blouse", "t-shirt", "tee", "sweater"]):
        return "top"
    elif any(word in text for word in ["pants", "trousers", "bottom", "skirt", "jeans", "shorts"]):
        return "bottom"
    return None

def get_opposite_type(clothing_type):
    return "bottom" if clothing_type == "top" else "top"

def chat_with_bot(user_query, image_path=None):
    global conversation_history, retrieved_context_memory

    followup_keywords = ["like that", "something", "those", "similar", "lighter", "darker", "match", "another"]
    is_followup = any(keyword in user_query.lower() for keyword in followup_keywords)

    image_context = pd.DataFrame()
    if image_path:
        image_features = encode_image(image_path)
        if image_features is not None and image_embeddings is not None:
            D, I = index.search(np.expand_dims(image_features, axis=0), 3)
            image_context = df.iloc[[valid_indices[i] for i in I[0]]]

    retrieved_text_context = pd.DataFrame()
    if not is_followup:
        query_tfidf = vectorizer.transform([user_query])
        text_similarities = cosine_similarity(query_tfidf, tfidf_matrix).flatten()
        top_text_indices = text_similarities.argsort()[::-1][:5]
        retrieved_text_context = df.iloc[top_text_indices]

    if is_followup and retrieved_context_memory:
        context_df = pd.DataFrame(retrieved_context_memory)
    else:
        context_df = pd.concat([retrieved_text_context, image_context]).drop_duplicates()
        retrieved_context_memory.clear()
        retrieved_context_memory.extend(context_df.to_dict(orient="records"))

    image_detected_type = image_context.iloc[0]['type'] if not image_context.empty else None
    text_detected_type = detect_type_from_text(user_query)
    identified_type = image_detected_type or text_detected_type
    opposite_type = get_opposite_type(identified_type) if identified_type else None

    if opposite_type and not context_df.empty:
        filtered_df = context_df[context_df['type'].str.lower() == opposite_type]
        if not filtered_df.empty:
            context_df = filtered_df

    if context_df.empty:
        rag_context = "No relevant product information found."
    else:
        rag_context = "\n\n".join(
            context_df[['name', 'description', 'category', 'color', 'material', 'type']]
            .astype(str)
            .agg(' | '.join, axis=1)
            .tolist()
        )

    history_str = "\n".join(
        [f"{msg['role'].capitalize()}: {msg['content']}" for msg in conversation_history]
    )

    prompt = (
        "You are a helpful fashion assistant. Based on the conversation so far and the products below, give the best response to the user's query.\n\n"
        f"Conversation so far:\n{history_str}\n\n"
        f"Product Information:\n{rag_context}\n\n"
        f"User: {user_query}"
    )

    gemini_model = genai.GenerativeModel("gemini-1.5-pro")
    response = gemini_model.generate_content(prompt)
    bot_reply = response.text.strip()

    conversation_history.append({"role": "user", "content": user_query})
    conversation_history.append({"role": "assistant", "content": bot_reply})

    return {
    "reply": bot_reply,
    "products": context_df.to_dict(orient="records")  # 👈 this must be present
}


def setup_bot(file_path="products.xlsx"):
    global model, preprocess, vectorizer, tfidf_matrix, image_embeddings, index, df, valid_indices

    xls = pd.ExcelFile(file_path)
    df = pd.read_excel(xls, sheet_name="products.csv")
    df.rename(columns={"materials.0": "material", "images.0": "image"}, inplace=True)
    df.columns = df.columns.str.lower()

    model, preprocess = clip.load("ViT-B/32", device=device)

    text_data = df[['name', 'description', 'category', 'color', 'material', 'type']].astype(str).agg(' '.join, axis=1)
    vectorizer = TfidfVectorizer(max_features=300)
    tfidf_matrix = vectorizer.fit_transform(text_data)

    image_embeddings = []
    valid_indices = []
    for idx, img_path in enumerate(df['image']):
        image_features = encode_image(img_path)
        if image_features is not None:
            image_embeddings.append(image_features)
            valid_indices.append(idx)

    if image_embeddings:
        image_embeddings = np.vstack(image_embeddings)
        index = faiss.IndexFlatL2(image_embeddings.shape[1])
        index.add(image_embeddings)
    else:
        image_embeddings = None
        index = None

    print("✅ Chatbot initialized.")
    return chat_with_bot
