import { CaseReducer, configureStore, createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { StartQueryActionCreatorOptions } from '@reduxjs/toolkit/dist/query/core/buildInitiate';
// for react, use '@reduxjs/toolkit/query/react'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

type EntityType = {
  value: number;
};

type AppState = {
  value: number;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
};

//
// api
//
const counterApi = createApi({
  reducerPath: 'counterApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    getIncrement: builder.query<EntityType, number | undefined>({ // <ResultType, QueryArg>
      //query: (n: number) => `counters/increment/${n}`,
      queryFn: (n: number | undefined, queryApi, extraOptions, baseQuery) => {
        return { data: {
          value: n ?? 1
        }};
      },
    }),
    getDecrement: builder.query<EntityType, number>({
      query: (n: number) => `counters/decrement/${n}`,
      // An explicit type must be provided to the raw result
      transformResponse: (rawResult: { result: { data: EntityType } }, meta) => {
        console.log('>>> transform respnse: meta', meta);
        return rawResult.result.data;
      }
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

  const { getIncrement } = counterApi.endpoints;

  // initiate
  const initiateQueryOption: StartQueryActionCreatorOptions = {
    subscribe: true,
    subscriptionOptions: {
      pollingInterval: 0,
      refetchOnReconnect: false,
      refetchOnFocus: false
    },
    forceRefetch: false,
  };
  const promise = store.dispatch(getIncrement.initiate(undefined, initiateQueryOption))
  const { abort, refetch, unsubscribe, unwrap, ...rest } = promise;
  expect(typeof abort).toBe('function');
  expect(typeof refetch).toBe('function');
  expect(typeof unsubscribe).toBe('function');
  expect(typeof unwrap).toBe('function');

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
  expectedInitialState.config.middlewareRegistered = true;

  const result = await promise;
  expect(result).toEqual({
    ...result,
    "data": {
      "value": 1,
    },
    "endpointName": "getIncrement",
    "isError": false,
    "isLoading": false,
    "isSuccess": true,
    "isUninitialized": false,
    "status": "fulfilled",
  });

  state = store.getState();
  expect(state.counterApi).toEqual({
    ...expectedInitialState,
    // updated properties
    queries: state.counterApi.queries,
    subscriptions: state.counterApi.subscriptions,
  });
});
