// notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DiscountIcon from '@mui/icons-material/Discount';
import BugReportIcon from '@mui/icons-material/BugReport';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import io from 'socket.io-client';

const socket = io(`${process.env.REACT_APP_LOCAL_URL}`); // Your backend socket URL



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
    default:
      return null; // or a default icon
  }
};
const initialNotifications = [
  {
    id: 1,
    icon: <CheckCircleOutlineIcon color="success" />,
    title: "Order Confirmed",
    description: "Your order #1234 has been confirmed and is being processed.",
    time: "2 mins ago",
    isRead: false
  },
  {
    id: 2,
    icon: <LocalShippingIcon color="primary" />,
    title: "Shipping Update",
    description: "Your package is out for delivery.",
    time: "1 hour ago",
    isRead: false
  },
  {
    id: 3,
    icon: <DiscountIcon color="secondary" />,
    title: "New Discount",
    description: "Get 20% off on summer collection!",
    time: "3 hours ago",
    isRead: false
  },
   {
    id: 4,
    icon: <DiscountIcon color="secondary" />,
    title: "New Discount",
    description: "Get 20% off on summer collection!",
    time: "3 hours ago",
    isRead: false
  },
   {
    id: 5,
    icon: <DiscountIcon color="secondary" />,
    title: "New Discount",
    description: "Get 20% off on summer collection!",
    time: "3 hours ago",
    isRead: false
  },
   {
    id: 6,
    icon: <DiscountIcon color="secondary" />,
    title: "New Discount",
    description: "Get 20% off on summer collection!",
    time: "3 hours ago",
    isRead: false
  }
];

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: initialNotifications,
    isOpen: false,
    unreadCount: initialNotifications.filter(notif => !notif.isRead).length,
        socket: null

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
        state.unreadCount -= 1;
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notif => {
        notif.isRead = true;
      });
      state.unreadCount = 0;
    },
    addNotification: (state, action) => {
      const newNotification = {
        ...action.payload,
        icon: getNotificationIcon(action.payload.title),
        isRead: false
      };
      state.notifications.unshift(newNotification);
      state.unreadCount += 1;
    },
    initializeSocket: (state) => {
      socket.on('new_notification', (notification) => {
        // Dispatch an action to add the new notification
        state.notifications.unshift(notification);
        state.unreadCount += 1;
      });
    }
  
  }
});

export const {
  toggleNotifications,
  closeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  addNotification
} = notificationSlice.actions;


// Export the socket connection action
export const initializeSocket = () => (dispatch) => {
  socket.on('new_notification', (notification) => {
    dispatch(addNotification(notification));
  });
};

export default notificationSlice.reducer;