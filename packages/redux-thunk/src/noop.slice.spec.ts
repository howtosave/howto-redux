import { configureStore } from '@reduxjs/toolkit';
import { fetchNoops, noopAdapter, noopReducer, NOOP_SLICE_KEY } from './noop.slice';

function createStore() {
  const store = configureStore({
    reducer: {
      [NOOP_SLICE_KEY]: noopReducer,
    },
  });

  return store;
}
describe('noop reducer', () => {
  it('should handle initial state', () => {
    const expected = noopAdapter.getInitialState({
      loadingStatus: 'idle',
      error: undefined,
    });

    expect(noopReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchNoops -- extraReducer cases', () => {
    let state = noopReducer(undefined, fetchNoops.pending('', undefined));
    expect(state).toEqual({
      loadingStatus: 'loading',
      error: undefined,
      entities: {},
      ids: [],
    });

    state = noopReducer(state, fetchNoops.fulfilled([{ id: 1 }], '', undefined));
    expect(state).toEqual({
      loadingStatus: 'loaded',
      error: undefined,
      entities: { 1: { id: 1 } },
      ids: [ 1 ],
    });

    state = noopReducer(
      state,
      fetchNoops.rejected(new Error('Uh oh'), '', undefined)
    );
    expect(state).toEqual({
      loadingStatus: 'error',
      error: 'Uh oh',
      entities: { 1: { id: 1 } },
      ids: [ 1 ],
    });
  });

  it('should handle fetchNoop -- createAsyncThunk', async () => {
    const store = createStore();
    const promise = store.dispatch(fetchNoops());
    expect(promise.requestId).toBeDefined();

    const res = await promise;
    expect(res.meta.requestStatus).toBe('fulfilled');
    expect(res.payload).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
