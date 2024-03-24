import { z } from 'zod';
import {
  createPostValidator,
  deletePostValidator,
  deleteUserValidator,
  getAllUsersValidator,
  getPostByIdValidator,
  getUserPostsValidator,
  postUpdateSchema,
  searchPostsValidator,
  userUpdateSchema,
} from './validators';

export type HandlerHttpRequestType =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS';

export interface HandlerOutput {
  statusCode: number;
  body: string; // this must be a string for serverless and aws to work,
  headers: Record<string, string>;
}

export type HandlerCallback<InputType> = (
  input: InputType
) => Promise<HandlerOutput>;

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  birthdate: Date | string;
  age?: number;
};

export type GetUsersResponse = {
  pagesLeft: number;
  result: User[];
};

export type GetUsersReq = z.infer<typeof getAllUsersValidator>;

export const updateUserValidator = z
  .object({
    userId: z.coerce.string(),
  })
  .merge(userUpdateSchema);

export type UpdateUserReq = z.infer<typeof updateUserValidator>;

export type DeleteUserReq = z.infer<typeof deleteUserValidator>;

// Posts

export type Post = {
  id: string;
  userId: string;
  title: string;
  body: string;
  created_at: Date;
  updated_at: Date;
};

export type CreatePostInput = z.infer<typeof createPostValidator>;

export type GetUserPostsInput = z.infer<typeof getUserPostsValidator>;

export type DeletePostInput = z.infer<typeof deletePostValidator>;

export type SearchPostsInput = z.infer<typeof searchPostsValidator>;

export type GetPostByIdReq = z.infer<typeof getPostByIdValidator>;

export type GetUserPostsResponse = {
  pagesLeft: number;
  result: Post[];
};

export const updatePostValidator = z
  .object({
    postId: z.coerce.string(),
    userId: z.coerce.string(),
  })
  .merge(postUpdateSchema);

export type UpdatePostInput = z.infer<typeof updatePostValidator>;

export type Event = {
  version: string;
  type: string;
  payload: Post | User | string;
};
