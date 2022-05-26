import { configureStore } from '@reduxjs/toolkit';
// for react, use '@reduxjs/toolkit/query/react'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';

type EntityType = {
  id: number;
  value: number;
};

type AuthUser = {
  id: number;
  name: string;
  token: string;
};

type LoginInput = {
  identifier: string;
  password: string;
};

type FindQueryArg = {
  limit?: number;
  skip?: number;
};

function getRandom(max = 1000) {
  return Math.floor(Math.random() * max);
}
//
// api
//
let gid = 1;
const counterApi = createApi({
  reducerPath: 'counterApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Entity', 'User'],
  endpoints: (builder) => ({
    getEntities: builder.query<EntityType[], FindQueryArg>({ // <ResultType, QueryArg>
      queryFn: (query, queryApi, extraOptions, baseQuery) => {
        const limit = query.limit ?? 2;
        return { data: Array.from({ length: limit }).map(() => ({ id: gid++, value: getRandom() })) };
      },
      providesTags: (res) => {
        console.log('>>>>>>>>>>>>>>>>>>>', res);
        return res
        ? [...res.map(({ id }) => ({ type: 'Entity' as const, id })), { type: 'Entity', id: 'LIST' }]
        : [{ type: 'Entity', id: 'LIST' }];
      }
    }),
    postDecrements: builder.query<EntityType[], undefined>({ // <ResultType, QueryArg>
      queryFn: (_, queryApi, extraOptions, baseQuery) => {
        return { data: Array.from({length:2}).map(() => ({ id: gid++, value: getRandom() * -1 })) };
      },
    }),
    postLogin: builder.mutation<AuthUser, LoginInput>({
      queryFn: (login) => {
        return { data: { id: 1, name: login.identifier, token: '...' } };
      },
      invalidatesTags: ['User'],
    })
  }),
});

const selectEntities = (queryArg: FindQueryArg, state: any) => counterApi.endpoints.getEntities.select(queryArg)(state);
const selectAuthUser = (fixedCacheKey: string, state: any) => counterApi.endpoints.postLogin.select(fixedCacheKey)(state);

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

test('# getEntities: basic action', async () => {
  const store = createStore();
  const { getEntities } = counterApi.endpoints;
  //
  // first fetch
  //
  let promise = store.dispatch(getEntities.initiate({skip: 0, limit: 2}, { forceRefetch: true }));
  let res = await promise;
  expect(res.status).toBe('fulfilled');
  expect(res.data?.length).toBe(2);

  let state = store.getState();
  let entryIds = state['counterApi'].provided['Entity']['LIST'];
  expect(entryIds.length).toBe(1);

  let entities = state['counterApi'].queries[entryIds[0]];
  expect(entities?.data).toBeDefined();
  expect((entities?.data as EntityType[])).toEqual(res.data);

  // refetch
  const prevData = (entities?.data as EntityType[]).map((e) => ({...e})); // clone
  await promise.refetch();
  state = store.getState();
  entryIds = state['counterApi'].provided['Entity']['LIST'];
  expect(entryIds.length).toBe(1); // no change expected
  entities = state['counterApi'].queries[entryIds[0]];
  expect(entities?.data).toEqual(prevData);

  promise.unsubscribe();

  //
  // second fetch
  //
  promise = store.dispatch(getEntities.initiate({skip: 2, limit: 2}, { forceRefetch: true }));
  res = await promise;
  expect(res.data?.length).toBe(2);

  state = store.getState();
  entryIds = state.counterApi.provided['Entity']['LIST'];
  // should have 2 entries
  expect(entryIds.length).toBe(2);

  entities = state['counterApi'].queries[entryIds[1]];
  expect(entities?.data).toEqual(res.data);

  promise.unsubscribe();
});

test('# getEntities: basic action using select', async () => {
  const store = createStore();
  const { getEntities } = counterApi.endpoints;
  //
  // first fetch
  //
  let promise = store.dispatch(getEntities.initiate({skip: 0, limit: 2}, { forceRefetch: true }));
  let res = await promise;
  expect(res.data?.length).toBe(2);

  let state = store.getState();
  let entities = selectEntities({skip: 0, limit: 2}, state);
  expect(entities.data?.length).toBe(2);
  expect(entities.data).toEqual(res.data);

  promise.unsubscribe();
  //
  // second fetch
  //
  promise = store.dispatch(getEntities.initiate({skip: 2, limit: 2}, { forceRefetch: true }));
  res = await promise;
  expect(res.data?.length).toBe(2);

  state = store.getState();
  entities = selectEntities({skip: 2, limit: 2}, state);
  expect(entities.data?.length).toBe(2);
  expect(entities.data).toEqual(res.data);

  promise.unsubscribe();
});

test('# getEntities: basic action using select', async () => {
  const store = createStore();
  const { postLogin } = counterApi.endpoints;
  //
  // login
  //
  const promise = store.dispatch(postLogin.initiate({identifier: 'user-id', password: 'user-pw'}));
  const { requestId } = promise;
  const res = await promise;
  const state = store.getState();

  expect(requestId).toBeDefined();
  const auth = selectAuthUser(requestId, state);
  expect(auth.data).toEqual({
    id: 1,
    name: 'user-id',
    token: '...'
  });
});
