import { Reducer } from 'redux';
import { configureStore } from '@reduxjs/toolkit';

type AppState = {
  value: number;
};

type ActionType = "incremented" | "decremented";

type AppAction = {
  type: ActionType;
  payload?: number;
};

const initialState: AppState = {
  value: 0,
};

//
// reducer
//
const counterReducer: Reducer<AppState, AppAction> = (state = initialState, action) => {
  switch (action.type) {
    case "incremented":
      return { ...state, value: state.value + (action.payload ?? 1) };
    case "decremented":
      return { ...state, value: state.value - (action.payload ?? 1) };
    default:
      return state;
  }
}

//
// store
//
const store = configureStore({
  reducer: counterReducer,
});

//
// test
//
test('# basic action', () => {
  const mockFn = jest.fn();
  // subscribe
  const unsubscribe = store.subscribe(mockFn);

  expect(store.getState()).toEqual({value: 0});
  expect(mockFn.mock.calls.length).toBe(0); // not called

  store.dispatch({ type: "incremented" });
  expect(store.getState()).toEqual({value: 1});
  expect(mockFn.mock.calls.length).toBe(1); // called once

  store.dispatch({ type: "decremented" });
  expect(store.getState()).toEqual({value: 0});
  expect(mockFn.mock.calls.length).toBe(2); // called once again

  // unsubscribe
  unsubscribe();

  store.dispatch({ type: "incremented" });
  expect(store.getState()).toEqual({value: 1});
  expect(mockFn.mock.calls.length).toBe(2); // not called
});
