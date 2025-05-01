import express from 'express';
import Notification from '../models/notifications.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get notifications for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Fetch both user-specific and broadcast notifications
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user.id },  // User-specific notifications
        { isBroadcast: true }        // Broadcast notifications
      ]
    })
    .sort({ timestamp: -1 })
    .limit(20); // Limit to most recent
    
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.notificationId, 
        $or: [
          { recipient: req.user.id },
          { isBroadcast: true }
        ]
      },
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
      { 
        $or: [
          { recipient: req.user.id, isRead: false },
          { isBroadcast: true, isRead: false }
        ]
      },
      { isRead: true }
    );
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Create broadcast notification (admin only)
router.post('/broadcast', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin (implement your admin check)
    // For example: if (!req.user.isAdmin) { ... }
    
    const { title, description, type } = req.body;
    
    const broadcastNotification = new Notification({
      title,
      description,
      type: type || 'announcement',
      isBroadcast: true
    });
    
    await broadcastNotification.save();
    
    // Broadcast to all connected users if io is available
    if (req.io) {
      req.io.emit('new_notification', {
        ...broadcastNotification.toObject(),
        time: 'Just now'
      });
    }
    
    res.status(201).json({
      message: 'Broadcast notification created successfully',
      notification: broadcastNotification
    });
  } catch (error) {
    console.error('Error creating broadcast notification:', error);
    res.status(500).json({ error: 'Failed to create broadcast notification' });
  }
});

export default router;