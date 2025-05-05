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

    const response = await axios.post('http://localhost:8001/chat', formData, {
      headers: formData.getHeaders(),
    });

    return res.json(response.data);

  } catch (err) {
    console.error("❌ Chatbot API error:", err.message);

    if (err.response) {
      console.error("🧠 Error status:", err.response.status);
      console.error("👉 Response data:", err.response.data);
    } else {
      console.error("❗ Unexpected error:", err.stack);
    }

    return res.status(500).json({ error: "Failed to get response from AI" });
  } finally {
    // Clean up uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.warn("⚠️ Failed to delete temp image:", unlinkErr.message);
      });
    }
  }
});

export default router;
