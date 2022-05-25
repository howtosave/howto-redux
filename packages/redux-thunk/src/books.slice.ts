import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
  PrepareAction,
} from '@reduxjs/toolkit';
import type { AppState } from './store';

export const BOOKS_FEATURE_KEY = 'books';

/*
 * Update these interfaces according to your requirements.
 */
export interface BooksEntity {
  id: number;
}

export interface BooksState extends EntityState<BooksEntity> {
  loading: 'idle' | 'pending' | 'loaded' | 'error';
  error?: string;
  currentRequestId?: string;
}

// generates a set of prebuilt reducers and selectors 
// for performing CRUD operations
export const booksAdapter = createEntityAdapter<BooksEntity>();

/**
 * Export an effect using createAsyncThunk from
 * the Redux Toolkit: https://redux-toolkit.js.org/api/createAsyncThunk
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(fetchBooks())
 * }, [dispatch]);
 * ```
 */
export const fetchBooks = createAsyncThunk(
  'books/fetchStatus',
  async (_, { getState, requestId }) => {
    const { currentRequestId, loading } = (getState() as AppState)[BOOKS_FEATURE_KEY];
    if (loading !== 'pending' || requestId !== currentRequestId) {
      return;
    }
    return Promise.resolve([]);
  }
);

export const initialBooksState: BooksState = booksAdapter.getInitialState({
  loading: 'idle',
  entities: {},
  currentRequestId: undefined,
  error: undefined,
});

export const booksSlice = createSlice({
  name: BOOKS_FEATURE_KEY,
  initialState: initialBooksState,
  reducers: {
    add: booksAdapter.addOne,
    remove: booksAdapter.removeOne,
    // ...
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state, action) => {
        if (state.loading === 'idle') {
          state.loading = 'pending';
          state.currentRequestId = action.meta.requestId;
        }
      })
      .addCase(
        fetchBooks.fulfilled, (state, action) => {
          booksAdapter.setAll(state, action.payload || []);
          state.loading = 'loaded';
        }
      )
      .addCase(fetchBooks.rejected, (state: BooksState, action) => {
        state.loading = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const booksReducer = booksSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(booksActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const booksActions = booksSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllBooks);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = booksAdapter.getSelectors();

export const getBooksState = (rootState: AppState): BooksState =>
  rootState[BOOKS_FEATURE_KEY];

export const selectAllBooks = createSelector(getBooksState, selectAll);

export const selectBooksEntities = createSelector(
  getBooksState,
  selectEntities
);
