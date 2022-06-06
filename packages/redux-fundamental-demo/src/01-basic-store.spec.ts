import React from 'react';
import { Reducer, createStore } from 'redux';
import { renderHook } from '@testing-library/react-hooks';
import { Provider, useDispatch } from "react-redux";
import { PayloadAction } from '@reduxjs/toolkit';

export type AppState = {
  value: number;
};

export type ActionType = "increment" | "decrement";

export type AppAction = {
  type: ActionType;
  payload?: number;
};
/* <==>
export type AppAction = PayloadAction<number, ActionType>;
*/

export type AppActions = {
  [name in ActionType]: (payload?: AppAction['payload']) => {
    type: name,
    payload
  };
};

export const initialState: AppState = {
  value: 0
};

//
// reducer
//
export const counterReducer: Reducer<AppState, AppAction> = (state = initialState, action) => {
  switch (action.type) {
    case "increment":
      return { ...state, value: state.value + (action.payload ?? 1) };
    case "decrement":
      return { ...state, value: state.value - (action.payload ?? 1) };
    default:
      return state;
  }
};

export const actions: AppActions = {
  increment: (payload) => ({ type: 'increment', payload }),
  decrement: (payload) => ({ type: 'decrement', payload }),
};

//
// store
//
export const store = createStore(counterReducer);

//
// test
//
test('# basic action', () => {
  // typify the result of store.dispatch
  let res: ReturnType<typeof store.dispatch>;
  let state = store.getState();
  expect(state).toEqual({value: 0});

  // typify store.dispatch at 'dispatch' generic function
  res = store.dispatch<AppAction>(actions.increment());
  expect(res.type).toBe('increment');
  expect(res.payload).toBe(undefined);

  state = store.getState();
  expect(state).toEqual({value: 1});

  res = store.dispatch(actions.increment(2));
  expect(res.payload).toBe(2);

  state = store.getState();
  expect(state).toEqual({value: 3});

  store.dispatch(actions.decrement(2));
  state = store.getState();
  expect(state).toEqual({value: 1});

  store.dispatch(actions.decrement());
  state = store.getState();
  expect(state).toEqual({value: 0});
});

export const wrapper = (props: {children: React.ReactNode}) => React.createElement(
  Provider,
  { store, ...props }
);

test('# with render hook', async () => {
  // initial state
  expect(store.getState()).toEqual({value: 0});
  let result;
  ({ result } = renderHook(() => useDispatch()({ type: "increment" }), { wrapper: wrapper }));
  expect(result.current.type).toBe('increment');
  expect(result.current.payload).toBe(undefined);
  // after increment
  expect(store.getState()).toEqual({value: 1});

  ({ result } = renderHook(() => useDispatch()(actions.increment(2)), { wrapper: wrapper }));
  // after increment
  expect(store.getState()).toEqual({value: 3});

  ({ result } = renderHook(() => useDispatch()(actions.decrement(2)), { wrapper: wrapper }));
  // after decrement
  expect(store.getState()).toEqual({value: 1});

  ({ result } = renderHook(() => useDispatch()({ type: "decrement" }), { wrapper: wrapper }));
  // after decrement
  expect(store.getState()).toEqual({value: 0});
});
