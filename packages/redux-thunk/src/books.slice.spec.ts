import { fetchBooks, booksActions, booksAdapter, booksReducer, BOOKS_FEATURE_KEY } from './books.slice';
import { store, useAppDispatch } from './store';

describe('books reducer', () => {
  it('should handle initial state', () => {
    const expected = {
      loading: 'idle',
      entities: {},
      currentRequestId: undefined,
      error: undefined,
      ids: [],
    };

    expect(store.getState()[BOOKS_FEATURE_KEY]).toEqual(expected);
  });

  it('should dispatch "add"/"remove" action', () => {
    const payload = { id: 1 };
    const expected = {
      loading: 'idle',
      entities: { [payload.id + '']: payload },
      currentRequestId: undefined,
      error: undefined,
      ids: [1],
    };
    
    store.dispatch(booksActions.add(payload));
    expect(store.getState()[BOOKS_FEATURE_KEY]).toEqual(expected);

    store.dispatch(booksActions.remove(payload.id));
    expect(store.getState()[BOOKS_FEATURE_KEY]).toEqual({
      ...expected,
      entities: {},
      ids: [],
    });
  });

  it.todo('should handle fetchBooks');
});
