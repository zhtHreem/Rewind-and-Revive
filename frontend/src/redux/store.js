// store.js
import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './slices/notificationsSlice.js';
export const store = configureStore({
  reducer: {
    notifications: notificationReducer
  }
});
