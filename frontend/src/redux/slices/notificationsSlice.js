// notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DiscountIcon from '@mui/icons-material/Discount';
import BugReportIcon from '@mui/icons-material/BugReport';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import MessageIcon from '@mui/icons-material/Message';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// Add this import at the top of notificationSlice.js
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';


const API_URL = process.env.REACT_APP_LOCAL_URL;

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: token };
};

const getNotificationIcon = (title) => {
  switch(title) {
    case 'Order Confirmed':
      return <CheckCircleOutlineIcon color="success" />;
    case 'Shipping Update':
      return <LocalShippingIcon color="primary" />;
    case 'New Discount':
      return <DiscountIcon color="secondary" />;
    case 'Test Notification':
      return <BugReportIcon color="orange" />;
    case 'Badge Unlocked!':
      return <LocalPoliceIcon color="orange" />; 
    case 'New Message':
      return <MessageIcon color="info" />;
      case 'Purchase Confirmed':
      return <ShoppingCartIcon color="success" />;
    case 'Product Sold':
      return <ShoppingCartIcon color="primary" />;
     // In your getNotificationIcon function, add:
    case 'Auction Won!':
       return <EmojiEventsIcon color="warning" />;
    // case 'Auction Ended':
    //    return <GavelIcon color="info" />; 
    default:
      return null;
  }
};

// Updated thunk action using axios with explicit headers
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      });
      console.log('Fetched notifications:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch notifications'
      );
    }
  }
);

// Helper function to format timestamps
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString();
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    isOpen: false,
    unreadCount: 0,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {
    openNotifications: (state) => {
      state.isOpen = true;
    },
    closeNotifications: (state) => {
      state.isOpen = false;
    },
    toggleNotifications: (state) => {
      state.isOpen = !state.isOpen;
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(
        notif => notif.id === action.payload
      );
      
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = state.unreadCount > 0 ? state.unreadCount - 1 : 0;
        
        // Call API to mark notification as read using axios
        axios.put(`${API_URL}/api/notifications/${notification.id}/read`, {}, {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          }
        }).catch(error => console.error('Error marking notification as read:', error));
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notif => {
        notif.isRead = true;
      });
      state.unreadCount = 0;
      
      // Call API to mark all notifications as read using axios
      axios.put(`${API_URL}/api/notifications/read-all`, {}, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      }).catch(error => console.error('Error marking all notifications as read:', error));
    },
    addNotification: (state, action) => {
      // Check if notification with this ID already exists
      const existingIndex = state.notifications.findIndex(n => n.id === action.payload.id);
      
      if (existingIndex >= 0) {
        // Update existing notification
        state.notifications[existingIndex] = {
          ...state.notifications[existingIndex],
          ...action.payload,
          isRead: false // Mark as unread when updated
        };
      } else {
        // Add new notification to the beginning of the array
        const newNotification = {
          ...action.payload,
          icon: getNotificationIcon(action.payload.title),
          isRead: false
        };
        state.notifications.unshift(newNotification);
        state.unreadCount += 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Format the notifications for display
        state.notifications = action.payload.map(notification => ({
          id: notification._id,
          icon: getNotificationIcon(notification.title),
          title: notification.title,
          description: notification.description,
          time: formatTimestamp(notification.timestamp),
          isRead: notification.isRead,
          product: notification.product,
          sender: notification.sender,
          count: notification.count || 1
        }));
        
        state.unreadCount = state.notifications.filter(notif => !notif.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const {
  toggleNotifications,
  openNotifications,
  closeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  addNotification
} = notificationSlice.actions;

export default notificationSlice.reducer;