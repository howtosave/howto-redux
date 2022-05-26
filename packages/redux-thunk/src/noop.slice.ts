import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';

export const NOOP_SLICE_KEY = 'noop';

/*
 * Update these interfaces according to your requirements.
 */
export interface NoopEntity {
  id: number;
}

export interface NoopState extends EntityState<NoopEntity> {
  loadingStatus: 'idle' | 'loading' | 'loaded' | 'error';
  error?: string;
}

export const noopAdapter = createEntityAdapter<NoopEntity>({
  selectId: (entity) => entity.id,
});

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
 *   dispatch(fetchNoops())
 * }, [dispatch]);
 * ```
 */
export const fetchNoops = createAsyncThunk(
  'noops/fetch',
  async (_: undefined, { getState, requestId }) => {
    const noops: NoopEntity[] = [{ id: 1 }, { id: 2 }];
    return new Promise<NoopEntity[]>((resolve) => setTimeout(() => (resolve(noops)), 10));
  }
);

export const initialNoopState: NoopState = noopAdapter.getInitialState({
  loadingStatus: 'idle',
  error: undefined,
});

export const noopSlice = createSlice({
  name: NOOP_SLICE_KEY,
  initialState: initialNoopState,
  reducers: {
    add: noopAdapter.addOne,
    remove: noopAdapter.removeOne,
    // ...
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNoops.pending, (state: NoopState) => {
        state.loadingStatus = 'loading';
        //console.log('>>>>>>>>>>> extraReducers:', JSON.stringify(state));
      })
      .addCase(
        fetchNoops.fulfilled,
        (state: NoopState, action: PayloadAction<NoopEntity[]>) => {
          noopAdapter.setAll(state, action.payload);
          state.loadingStatus = 'loaded';
          //console.log('>>>>>>>>>>> extraReducers:', JSON.stringify(state), JSON.stringify(action));
        }
      )
      .addCase(fetchNoops.rejected, (state: NoopState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
        //console.log('>>>>>>>>>>> extraReducers:', JSON.stringify(state), JSON.stringify(action));
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const noopReducer = noopSlice.reducer;

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
 *   dispatch(noopActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const noopActions = noopSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllNoop);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = noopAdapter.getSelectors();

export const getNoopState = (rootState: unknown): NoopState =>
  rootState[NOOP_SLICE_KEY];

export const selectAllNoop = createSelector(getNoopState, selectAll);

export const selectNoopEntities = createSelector(getNoopState, selectEntities);
