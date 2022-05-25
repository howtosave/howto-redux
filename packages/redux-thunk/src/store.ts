import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux'
import { BOOKS_FEATURE_KEY, booksReducer } from './books.slice';

export const rootReducer = {
  [BOOKS_FEATURE_KEY]: booksReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  // Additional middleware can be passed to this array
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env['NODE_ENV'] !== 'production',
  // Optional Redux store enhancers
  enhancers: [],
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
// Export a hook that can be reused to resolve types
