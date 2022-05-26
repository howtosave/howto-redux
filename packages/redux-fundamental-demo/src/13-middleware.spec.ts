import { Reducer, Middleware } from 'redux';
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
// test
//
test('# basic action', () => {
  const mockFn = jest.fn();
  const middleware: Middleware = (storeApi) => (next) => (action) => {
    mockFn();
    return next(action);
  };
  const store = configureStore({
    reducer: counterReducer,
    middleware: (gdm) => gdm().concat(middleware),
  });
  expect(mockFn.mock.calls.length).toBe(0);

  store.dispatch({ type: "incremented" });
  expect(mockFn.mock.calls.length).toBe(1); // called when dispatch

  store.dispatch({ type: "incremented" });
  expect(mockFn.mock.calls.length).toBe(2);
});
