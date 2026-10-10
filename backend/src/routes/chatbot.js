import express from 'express';
import multer from 'multer';
import { chat } from '../controllers/chatbot.js';

const router = express.Router();

// Photos are kept in memory (never written to disk) and capped below Vercel's 4.5 MB body limit.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3.5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});

router.post('/chat', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(413).json({ error: 'That photo is too large. Try a smaller one.' });
    next();
  });
}, chat);

export default router;
