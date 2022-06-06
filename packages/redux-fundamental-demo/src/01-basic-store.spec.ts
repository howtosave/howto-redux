import { Reducer, createStore, Dispatch, Action } from 'redux';
//import { PayloadAction } from '@reduxjs/toolkit';

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

export const actions: AppActions = {
  increment: (payload) => ({ type: 'increment', payload }),
  decrement: (payload) => ({ type: 'decrement', payload }),
};

export type IncrementDispatch = () => AppState;

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

