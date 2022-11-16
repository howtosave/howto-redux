import { CaseReducer, configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

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


const store = configureStore({
  reducer: {
     [counterSlice.name]: counterSlice.reducer,
  },
});

//
// test
//
test('# basic action', () => {
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

type StoreRootState = ReturnType<typeof store.getState>
type StoreDispatchType = typeof store.dispatch;
type StoreSubscribeType = typeof store.subscribe;

type StoreReducerType = typeof counterSlice.reducer;
type StoreReducerActionType = typeof counterSlice.actions;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<StoreDispatchType>();
export const useAppSelector: TypedUseSelectorHook<StoreRootState> = useSelector;
export const useCounterSelector: TypedUseSelectorHook<StoreRootState['counter']> = useSelector;
