import { configureStore } from '@reduxjs/toolkit';
import { StartQueryActionCreatorOptions } from '@reduxjs/toolkit/dist/query/core/buildInitiate';
// for react, use '@reduxjs/toolkit/query/react'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

type EntityType = {
  value: number;
};

//
// api
//
const counterApi = createApi({
  reducerPath: 'counterApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    getCounters: builder.query<EntityType[], undefined>({ // <ResultType, QueryArg>
      //query: () => `counters`,
      queryFn: (_, queryApi, extraOptions, baseQuery) => {
        return { data: [1, 2, 3].map(e => ({ value: e })) };
      },
    }),
    postIncrement: builder.mutation<EntityType, Partial<EntityType>>({ // <ResultType, QueryArg>
      //query: (n: number) => `counters/increment/${n}`,
      queryFn: ({ value = 0 }, queryApi, extraOptions, baseQuery) => {
        return { data: { value }};
      },
    }),
    getDecrement: builder.query<EntityType, number | undefined>({
      // query: (n: number) => `counters/decrement/${n}`,
      queryFn: (n: number | undefined, queryApi, extraOptions, baseQuery) => {
        return { data: {
          value: n ?? 1
        }};
      },
    }),
  }),
});

//
// test
//
function createStore() {
  const store = configureStore({
    reducer: {
       [counterApi.reducerPath]: counterApi.reducer,
    },
    middleware: (gdf) => gdf().concat(counterApi.middleware),
  });
  return store;
}

test('# basic action', async () => {
  const store = createStore();
  const expectedInitialState = {
    "config": {
      "focused": true,
      "keepUnusedDataFor": 60,
      "middlewareRegistered": false,
      "online": true,
      "reducerPath": "counterApi",
      "refetchOnFocus": false,
      "refetchOnMountOrArgChange": false,
      "refetchOnReconnect": false,
      },
      "mutations": {},
      "provided": {},
      "queries": {},
      "subscriptions": {},
  };

  let state = store.getState();
  // initial state
  expect(state.counterApi).toEqual(expectedInitialState);

  const { getCounters } = counterApi.endpoints;

  //
  // check initial state
  //
  const initiateQueryOption: StartQueryActionCreatorOptions = {
    subscribe: true,
    subscriptionOptions: {
      pollingInterval: 0,
      refetchOnReconnect: false,
      refetchOnFocus: false
    },
    forceRefetch: false,
  };
  const promise = store.dispatch(getCounters.initiate(undefined, initiateQueryOption))
  const { abort, refetch, unsubscribe, unwrap } = promise;
  expect(typeof abort).toBe('function');
  expect(typeof refetch).toBe('function');
  expect(typeof unsubscribe).toBe('function');
  expect(typeof unwrap).toBe('function');
  // redux state
  state = store.getState();
  expect(state.counterApi).toEqual({
    ...expectedInitialState,
    // updated properties
    config: {
      ...expectedInitialState.config,
      middlewareRegistered: true,
    },
    queries: state.counterApi.queries,
    subscriptions: state.counterApi.subscriptions,
  });
  // update initial state for conveniency
  expectedInitialState.config.middlewareRegistered = true;

  //
  // check fetch result
  //
  const result = await promise;
  expect(result).toEqual({
    ...result,
    data: [1, 2, 3].map(e => ({ value: e })),
    "endpointName": "getCounters",
    "isError": false,
    "isLoading": false,
    "isSuccess": true,
    "isUninitialized": false,
    "status": "fulfilled",
  });
  // redux state
  state = store.getState();
  expect(state.counterApi).toEqual({
    ...expectedInitialState,
    // updated properties
    queries: state.counterApi.queries,
    subscriptions: state.counterApi.subscriptions,
  });
});

test('# mutation action', async () => {
  const store = createStore();
  const expectedInitialState = {
    "config": {
      "focused": true,
      "keepUnusedDataFor": 60,
      "middlewareRegistered": true,
      "online": true,
      "reducerPath": "counterApi",
      "refetchOnFocus": false,
      "refetchOnMountOrArgChange": false,
      "refetchOnReconnect": false,
      },
      "mutations": {},
      "provided": {},
      "queries": {},
      "subscriptions": {},
  };

  const { postIncrement } = counterApi.endpoints;
  const promise = store.dispatch(postIncrement.initiate({ value: 1 }, { track: false }));

  const { abort, reset, unwrap } = promise;
  expect(typeof abort).toBe('function');
  expect(typeof reset).toBe('function');
  expect(typeof unwrap).toBe('function');

  const result = await promise;
  expect(result).toEqual({
    data: { value: 1 },
  });
  // redux state
  const state = store.getState();
  expect(state.counterApi).toEqual({
    ...expectedInitialState,
    // updated properties
    queries: state.counterApi.queries,
    subscriptions: state.counterApi.subscriptions,
  });
});
