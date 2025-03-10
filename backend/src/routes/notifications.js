// src/routes/notification.js
import express from 'express';
import Notification from '../models/notifications.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();


// In notification.js routes
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching notifications for user:', req.user.id); // Debug
    
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ timestamp: -1 })
      .limit(20); // Limit to most recent
    
    console.log('Found notifications:', notifications.length); // Debug
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});
// Mark notification as read
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default router;