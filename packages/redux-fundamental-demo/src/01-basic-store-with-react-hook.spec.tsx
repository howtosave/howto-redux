import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { Provider, useDispatch } from "react-redux";
import { 
  store,
  actions,
} from './01-basic-store.spec';

export const wrapper = (props: {children: React.ReactNode}) => React.createElement(
  Provider,
  { store, ...props }
);

export const useIncrement = () => {
  const dispatch = useDispatch();
  const increment = React.useCallback((amount?: number) => {
    const res = dispatch(actions.increment(amount ?? 1));
    return res;
  }, [dispatch]);
  return {
    increment,
  };
};

export const useCounter = () => {
  const dispatch = useDispatch();
  const increment = React.useCallback((amount?: number) => dispatch(actions.increment(amount ?? 1)), [dispatch]);
  const decrement = React.useCallback((amount?: number) => dispatch(actions.decrement(amount ?? 1)), [dispatch]);
  return {
    increment,
    decrement,
  };
}

test('# test with render hook', () => {
  // initial state
  expect(store.getState()).toEqual({value: 0});
  let result;
  ({ result } = renderHook(() => useDispatch()({ type: "increment" }), { wrapper }));
  expect(result.current.type).toBe('increment');
  expect(result.current.payload).toBe(undefined);
  // after increment
  expect(store.getState()).toEqual({value: 1});

  ({ result } = renderHook(() => useDispatch()(actions.increment(2)), { wrapper }));
  // after increment
  expect(store.getState()).toEqual({value: 3});

  ({ result } = renderHook(() => useDispatch()(actions.decrement(2)), { wrapper }));
  // after decrement
  expect(store.getState()).toEqual({value: 1});

  ({ result } = renderHook(() => useDispatch()({ type: "decrement" }), { wrapper }));
  // after decrement
  expect(store.getState()).toEqual({value: 0});
});

test('# test hooks with render hook', () => {
  const { result } = renderHook(() => useIncrement(), { wrapper });
  const { result: result2 } = renderHook(() => useCounter(), { wrapper });

  let res;
  act(() => { res = result.current.increment(1); });
  expect(res).toEqual({ type: 'increment', payload: 1 });
  expect(store.getState()).toEqual({value: 1});

  act(() => { result.current.increment(2); });
  expect(store.getState()).toEqual({value: 3});

  act(() => { result2.current.decrement(2); });
  expect(store.getState()).toEqual({value: 1});

  act(() => { result2.current.decrement(1); });
  expect(store.getState()).toEqual({value: 0});
});
