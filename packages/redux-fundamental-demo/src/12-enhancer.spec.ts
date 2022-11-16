import { Reducer, StoreEnhancer, compose } from 'redux';
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
  const enhancer: StoreEnhancer = (createStore) => (reducer, initialState) => {
    mockFn();
    return createStore(reducer, initialState);
  };
  const store = configureStore({
    reducer: counterReducer,
    enhancers: [enhancer],
  });
  expect(mockFn.mock.calls.length).toBe(1); // called when creating store

  store.dispatch({ type: "incremented" });
  expect(mockFn.mock.calls.length).toBe(1);

  store.dispatch({ type: "incremented" });
  expect(mockFn.mock.calls.length).toBe(1);
});

test('# use compose', () => {
  const mockFn1 = jest.fn();
  const enhancer1: StoreEnhancer = createStore => (reducer, initialState) => {
    mockFn1();
    return createStore(reducer, initialState);
  };
  const mockFn2 = jest.fn();
  const enhancer2: StoreEnhancer = createStore => (reducer, initialState) => {
    mockFn2();
    return createStore(reducer, initialState);
  };
  const store = configureStore({
    reducer: counterReducer,
    enhancers: [compose(enhancer1, enhancer2)],
  });
  expect(mockFn1.mock.calls.length).toBe(1); // called when creating store
  expect(mockFn2.mock.calls.length).toBe(1); // called when creating store
});