import { Reducer, combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';

//
// counter
//
type CounterState = {
  value: number;
};

type CounterActionType = "incremented" | "decremented";

type CounterAction = {
  type: CounterActionType;
  payload?: number;
};

const initialState: CounterState = {
  value: 0,
};

const counterReducer: Reducer<CounterState, CounterAction> = (state = initialState, action) => {
  switch (action.type) {
    case "incremented":
      return { ...state, value: state.value + (action.payload ?? 1) };
    case "decremented":
      return { ...state, value: state.value - (action.payload ?? 1) };
    default:
      return state;
  }
};

//
// array
//
type ArrayState = {
  array: number[];
};

type ArrayActionType = "added" | "removed";

type ArrayAction = {
  type: ArrayActionType;
  payload: number;
};

const initialArrayState: ArrayState = {
  array: [],
};

const arrayReducer: Reducer<ArrayState, ArrayAction> = (state = initialArrayState, action) => {
  switch (action.type) {
    case "added":
      return { array: state.array.concat(action.payload) };
    case "removed":
      return { array: state.array.filter((e) => e !== action.payload) };
    default:
      return state;
  }
};

//
// combine reducers
//
type AppAction = CounterAction | ArrayAction;
type AppState = {
  counter: CounterState,
  array: ArrayState,
};

const rootReducer = (state = {} as AppState, action: AppAction) => {
  return {
    counter: counterReducer(state.counter, action as CounterAction),
    array: arrayReducer(state.array, action as ArrayAction),
  };
};
// or use combineReducers()
const combinedRootReducer = combineReducers({
  counter: counterReducer,
  array: arrayReducer,
});

//
// store
//
const store = configureStore({
  reducer: combinedRootReducer,
});

//
// test
//
test('# basic action', () => {
  let state = store.getState();
  expect(state.counter).toEqual({value: 0});
  expect(state.array).toEqual({array: []});

  //
  // counter
  //
  store.dispatch({ type: "incremented" });
  state = store.getState();
  expect(state.counter).toEqual({value: 1});

  store.dispatch({ type: "incremented", payload: 2 });
  state = store.getState();
  expect(state.counter).toEqual({value: 3});

  store.dispatch({ type: "decremented", payload: 2 });
  state = store.getState();
  expect(state.counter).toEqual({value: 1});

  store.dispatch({ type: "decremented" });
  state = store.getState();
  expect(state.counter).toEqual({value: 0});

  //
  // array
  //
  store.dispatch({ type: 'added', payload: 1 });
  state = store.getState();
  expect(state.array).toEqual({array: [1]});

  store.dispatch({ type: 'removed', payload: 1 });
  state = store.getState();
  expect(state.array).toEqual({array: []});
});
