import { Reducer, createStore } from 'redux';

type AppState = {
  value: number;
};

type ActionType = "incremented" | "decremented";

type AppAction = {
  type: ActionType;
  payload?: number;
};

const initialState: AppState = {
  value: 0
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
const store = createStore(counterReducer);

//
// test
//
test('# basic action', () => {
  let state = store.getState();
  expect(state).toEqual({value: 0});

  store.dispatch({ type: "incremented" });
  state = store.getState();
  expect(state).toEqual({value: 1});

  store.dispatch({ type: "incremented", payload: 2 });
  state = store.getState();
  expect(state).toEqual({value: 3});

  store.dispatch({ type: "decremented", payload: 2 });
  state = store.getState();
  expect(state).toEqual({value: 1});

  store.dispatch({ type: "decremented" });
  state = store.getState();
  expect(state).toEqual({value: 0});
});

//
// Types
//

type StoreStateType = ReturnType<typeof store.getState>
type StoreDispatchType = typeof store.dispatch;
type StoreSubscribeType = typeof store.subscribe;

