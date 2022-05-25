import { CaseReducer, configureStore, createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

type AppState = {
  value: number;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
};

/**
 * 
// same as PayloadAction<number>

type ActionType = "incremented" | "decremented";

type AppAction = {
  type: ActionType;
  payload?: number;
};

 */

const initialState: AppState = {
  value: 0,
  loading: 'idle',
};

//
// thunk
//
const fetchIncrement = createAsyncThunk(
  'counter/increment',
  async (n: number | undefined, thunkAPI) => {
    return Promise.resolve(n ?? 1);
  }
);
const fetchDecrement = createAsyncThunk(
  'counter/decrement',
  async (n: number | undefined, thunkAPI) => {
    return Promise.resolve(n ?? 1);
  }
);

//
// slice
//
const incremented: CaseReducer<AppState, PayloadAction<number | undefined>> = (state, action) => {
  state.value += (action.payload ?? 1);
};
const decremented: CaseReducer<AppState, PayloadAction<number | undefined>> = (state, action) => {
  state.value -= (action.payload ?? 1);
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    incremented,
    decremented,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchIncrement.fulfilled, (state, action) => {
      state.loading = 'succeeded';
      incremented(state, action);
    })
    .addCase(fetchIncrement.pending, (state, action) => {
      state.loading = 'pending';
    })
    .addCase(fetchIncrement.rejected, (state, action) => {
      state.loading = 'failed';
    })
    .addCase(fetchDecrement.fulfilled, (state, action) => {
      state.loading = 'succeeded';
      decremented(state, action);
    })
    .addCase(fetchDecrement.pending, (state, action) => {
      state.loading = 'pending';
    })
    .addCase(fetchDecrement.rejected, (state, action) => {
      state.loading = 'failed';
    })
  },
});

const counterActions = counterSlice.actions;

//
// test
//
test('# basic action', async () => {
  const store = configureStore({
    reducer: {
       [counterSlice.name]: counterSlice.reducer,
    },
  });

  let state = store.getState();
  expect(state.counter.value).toBe(0);

  await store.dispatch(fetchIncrement());
  state = store.getState();
  expect(state.counter.value).toBe(1);

  await store.dispatch(fetchIncrement(2));
  state = store.getState();
  expect(state.counter.value).toBe(3);

  await store.dispatch(fetchDecrement(2));
  state = store.getState();
  expect(state.counter.value).toBe(1);

  await store.dispatch(fetchDecrement());
  state = store.getState();
  expect(state.counter.value).toBe(0);
});


test('# thunk state', async () => {
  const store = configureStore({
    reducer: {
       [counterSlice.name]: counterSlice.reducer,
    },
  });

  expect(store.getState().counter.loading).toBe('idle');

  const promise = store.dispatch(fetchIncrement());
  expect(store.getState().counter.loading).toBe('pending');

  const res = await promise;
  expect(store.getState().counter.loading).toBe('succeeded');
  expect(res.meta.requestStatus).toBe('fulfilled');
});
