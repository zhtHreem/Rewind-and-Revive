import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), async (req, res) => {
  const { user_query } = req.body;

  if (!user_query) {
    return res.status(400).json({ error: "user_query is required" });
  }

  try {
    const formData = new FormData();
    formData.append('user_query', user_query);

    if (req.file) {
      formData.append('image', fs.createReadStream(req.file.path));
    }

    const response = await axios.post('http://localhost:8000/chat', formData, {
      headers: formData.getHeaders(),
    });

    return res.json({ reply: response.data.reply });
  } catch (err) {
    console.error("❌ Chatbot API error:", err.message);
    return res.status(500).json({ error: "Failed to get response from AI" });
  }
});

export default router;
