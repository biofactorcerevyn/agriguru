import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './slices/weatherSlice';

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
  // Enable Redux DevTools extension
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;