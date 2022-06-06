import React from 'react';
import { 
  AppState, 
  AppActions,
  store,
  actions,
} from './01-basic-store.spec';
import { wrapper, useIncrement } from './01-basic-store-with-react-hook.spec';
import { renderHook, act } from '@testing-library/react';

test('# with react renderHook', () => {
  const { result } = renderHook(() => useIncrement(), { wrapper });
  act(() => { result.current.increment(); });
  expect(store.getState()).toEqual({value: 1});
});
