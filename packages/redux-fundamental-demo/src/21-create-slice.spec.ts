import { CaseReducer, configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

type AppState = {
  value: number;
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
};

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
});

//
// test
//
test('# basic action', () => {
  const store = configureStore({
    reducer: {
       [counterSlice.name]: counterSlice.reducer,
    },
  });
  const { actions } = counterSlice;

  let state = store.getState();
  expect(state.counter).toEqual({value: 0});

  store.dispatch(actions.incremented());
  state = store.getState();
  expect(state.counter).toEqual({value: 1});

  store.dispatch(actions.incremented(2));
  state = store.getState();
  expect(state.counter).toEqual({value: 3});

  store.dispatch(actions.decremented(2));
  state = store.getState();
  expect(state.counter).toEqual({value: 1});

  store.dispatch(actions.decremented());
  state = store.getState();
  expect(state.counter).toEqual({value: 0});
});
