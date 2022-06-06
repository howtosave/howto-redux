import { Reducer } from 'redux';
import { configureStore, createAction, createReducer, PayloadAction } from '@reduxjs/toolkit';

type AppState = {
  value: number;
};
type PayloadType = number;

//
// actions
//
const reset = createAction('counter/reset');
const increment = createAction<PayloadType>('counter/increment');
const decrement = createAction<PayloadType>('counter/decrement');

// initial state
const initialState: AppState = {
  value: 0,
};

//
// reducer
//
const counterReducer = createReducer<AppState>(initialState, (builder) => {
  builder
  .addCase(reset, () => initialState)
  .addCase(increment, (state, action) => {
    state.value += action.payload ?? 1;
  })
  .addCase(decrement, (state, action) => {
    state.value -= action.payload ?? 1;
  })
  .addMatcher((action) => {
    return typeof action.payload === 'number';
  }, (state, action) => {
    // no chnages
  })
  .addDefaultCase((state, action) => {
    // no changes
  });
});

//
// reducer types
//
//type ReducerState = ReturnType<typeof counterReducer>;
/* <==>
This type should same as 'AppState' above
*/
//
// store
//
const store = configureStore({
  reducer: counterReducer,
});

//
// store types
//
type AppDispatch = typeof store.dispatch;

//type AppStateType = ReturnType<typeof store.getState>;
/* <==>
This type should same as 'AppState' above
*/

//
// test
//
test('# basic action', () => {
  let state = store.getState();
  expect(state).toEqual({value: 0});

  //let res: AppDispatch;

  let res = store.dispatch<ReturnType<typeof increment>>({ type: increment.type, payload: undefined });
  state = store.getState();
  expect(state).toEqual({value: 1});

  res = store.dispatch<ReturnType<typeof increment>>(increment(2));
  expect(res.type).toBe('counter/increment');
  expect(res.payload).toBe(2);
  state = store.getState();
  expect(state).toEqual({value: 3});

  res = store.dispatch(decrement(2));
  state = store.getState();
  expect(state).toEqual({value: 1});

  store.dispatch({ type: decrement.type });
  state = store.getState();
  expect(state).toEqual({value: 0});
});
