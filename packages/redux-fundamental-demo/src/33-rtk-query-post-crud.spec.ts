/**
 * Example from https://redux-toolkit.js.org/rtk-query/usage/mutations#advanced-mutations-with-revalidation
 */

 import { configureStore } from '@reduxjs/toolkit';
// Or from '@reduxjs/toolkit/query/react' if using the auto-generated hooks
import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query'

export interface Post {
  id: number
  name: string
}
type PostResponse = {
  data: Post;
};
type PostDelResponse = {
  data: {
    success: boolean;
    id: number;
  }
};
type PostsResponse = Post[];
type PostCreateDto = Omit<Post, 'id'>;
type PostUpdateDto = Pick<Post, 'id'> & Partial<Post>;

type FindQueryArg = {
  limit?: number;
  skip?: number;
};

let gid = 1;
/* const mockData: Post[] = Array.from({ length: 10 }).map(() => ({
  id: gid++,
  name: `post ${gid}`,
}));
 */
class MockDb {
  public mockData = [] as Post[];

  constructor() {
    this.reset();
  }

  reset() {
    for (let i = 0; i < 10; i ++) {
      this.mockData.push(
      Object.assign({}, {
        id: gid++,
        name: `post ${gid}`,
      }));
    }
  }

  createPost(input: PostCreateDto): Post {
    const post = {...input, id: gid++ };
    this.mockData.push(post);
    return post;
  }
  
  getPost(rid: number): Post | undefined {
    return this.mockData.find(({ id }) => id === rid);
  }
  
  hasPost(rid: number): boolean {
    return this.mockData.findIndex(({ id }) => id === rid) >= 0;
  }
  
  updatePost(input: PostUpdateDto): Post | undefined {
    const post = this.getPost(input.id);
    if (!post) return undefined;
    Object.assign(post, input);
    return post;
  }
  
  deletePost(rid: number): boolean {
    const idx = this.mockData.findIndex(({ id }) => id === rid);
    if (idx < 0) return false;
    this.mockData.splice(idx, 1);
    return true;
  }
}

const mockDb = new MockDb();


/**
 * Type predicate to narrow an unknown error to `FetchBaseQueryError`
 */
 export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error
}

/**
 * Type predicate to narrow an unknown error to an object with a string 'message' property
 */
export function isErrorWithMessage(
  error: unknown
): error is { message: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

export const postApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Posts'],
  endpoints: (build) => ({
    getPosts: build.query<PostsResponse, FindQueryArg>({
      queryFn: (arg) => ({ data: mockDb.mockData }),
      // Provides a list of `Posts` by `id`.
      // If any mutation is executed that `invalidate`s any of these tags, this query will re-run to be always up-to-date.
      // The `LIST` id is a "virtual id" we just made up to be able to invalidate this query specifically if a new `Posts` element was added.
      providesTags: (result) =>
        // is result available?
        result
          ? // successful query
            [
              ...result.map(({ id }) => ({ type: 'Posts', id } as const)),
              { type: 'Posts', id: 'LIST' },
            ]
          : // an error occurred, but we still want to refetch this query when `{ type: 'Posts', id: 'LIST' }` is invalidated
            [{ type: 'Posts', id: 'LIST' }],
    }),
    addPost: build.mutation<Post, PostCreateDto>({
      queryFn(arg) {
        mockDb.reset();
        return { data: mockDb.createPost(arg) }
      },
      // Invalidates all Post-type queries providing the `LIST` id - after all, depending of the sort order,
      // that newly created post could show up in any lists.
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
    getPost: build.query<Post, number>({
      queryFn: (id) => {
        return mockDb.hasPost(id) 
          ? { data: mockDb.getPost(id) as Post } 
          : { error: { status: 404, data: 'NotFound' } };
      },
      providesTags: (result, error, id) => [{ type: 'Posts', id }],
    }),
    updatePost: build.mutation<Post, PostUpdateDto>({
      queryFn(arg) {
        if (!mockDb.hasPost(arg.id)) return { error: { status: 404, data: 'NotFound' } };
        try {
          return { data: mockDb.updatePost(arg) as Post };
        } catch (e) {
          return {
            error: { status: 500, data: e.message },
          }
        }
      },
      // Invalidates all queries that subscribe to this Post `id` only.
      // In this case, `getPost` will be re-run. `getPosts` *might*  rerun, if this id was under its results.
      invalidatesTags: (result, error, { id }) => [{ type: 'Posts', id }],
    }),
    deletePost: build.mutation<{ success: boolean; id: number }, number>({
      queryFn(id) {
        return { data: { success: mockDb.deletePost(id), id } };
      },
      // Invalidates all queries that subscribe to this Post `id` only.
      invalidatesTags: (result, error, id) => [{ type: 'Posts', id }],
    }),
  }),
})

const selectPosts = (queryArg: FindQueryArg, state: any) => postApi.endpoints.getPosts.select(queryArg)(state);
const selectPost = (id: number, state: any) => postApi.endpoints.getPost.select(id)(state);

//
// test
//
function createStore() {
  const store = configureStore({
    reducer: {
       [postApi.reducerPath]: postApi.reducer,
    },
    middleware: (gdf) => gdf().concat(postApi.middleware),
  });
  return store;
}

test('# basic action', async () => {
  const store = createStore();
  const { getPosts, getPost, addPost, updatePost, deletePost } = postApi.endpoints;
  //
  // find
  //
  const promiseFind = store.dispatch(getPosts.initiate({skip: 0}, { forceRefetch: true }));
  const resFind = await promiseFind;

  const posts = selectPosts({skip: 0}, store.getState());
  expect(posts.data).toEqual(mockDb.mockData);

  //
  // findById
  //
  const promiseFindById = store.dispatch(getPost.initiate(mockDb.mockData[1].id, { forceRefetch: true }));
  const resFindById = await promiseFindById;
  expect(resFindById.data).toEqual(mockDb.mockData[1]);
  const post = selectPost(mockDb.mockData[1].id, store.getState());
  expect(post.data).toEqual(mockDb.mockData[1]);

  //
  // add
  //
  const addInput = { name: 'new post' };
  const promiseAdd = store.dispatch(addPost.initiate(addInput, {}));
  const resAdd = await promiseAdd;
  //expect(resAdd?.error).toBe(undefined);
  expect((resAdd as PostResponse).data).toEqual(mockDb.mockData[mockDb.mockData.length - 1]);

  //
  // update
  //
  const updateInput = {...mockDb.mockData[2], name: 'updated post' };
  const promiseUpdate = store.dispatch(updatePost.initiate(updateInput, {}));
  const resUpdate = await promiseUpdate;
  //expect(resUpdate?.error).toBe(undefined);
  expect((resUpdate as PostResponse).data).toEqual(updateInput);

  //
  // delete
  //
  const deletedId = mockDb.mockData[1].id;
  const promiseDelete = store.dispatch(deletePost.initiate(deletedId, {}));
  const resDelete = await promiseDelete;
  expect((resDelete as PostDelResponse).data).toEqual({ success: true, id: deletedId});

});
