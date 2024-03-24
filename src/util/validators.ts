import { z } from 'zod';

export const userUpdateSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    birthdate: z.string().datetime().optional(),
  })
  .strict();

export const getAllUsersValidator = z.object({
  pageSize: z.coerce.number().min(1, 'pageSize must be greater than 0'),
  currentPage: z.coerce.number().min(1, 'currentPage must be greater than 1'),
});

export const deleteUserValidator = z.object({
  userId: z.coerce.string(),
});

// Posts

const postCreationSchema = z
  .object({
    title: z.string(),
    body: z.string(),
  })
  .strict();

export const createPostValidator = z
  .object({
    userId: z.coerce.string(),
  })
  .merge(postCreationSchema);

export const postUpdateSchema = z
  .object({
    title: z.string().optional(),
    body: z.string().optional(),
  })
  .strict();

export const deletePostValidator = z.object({
  userId: z.coerce.string(),
  postId: z.coerce.string(),
});

export const getPostByIdValidator = z.object({
  postId: z.coerce.string(),
});

export const getUserPostsValidator = z.object({
  userId: z.coerce.string(),
  pageSize: z.coerce.number().min(1, 'pageSize must be greater than 0'),
  currentPage: z.coerce.number().min(1, 'currentPage must be greater than 1'),
});

export const searchPostsValidator = z.object({
  title: z.coerce.string(),
  pageSize: z.coerce.number().min(1, 'pageSize must be greater than 0'),
  currentPage: z.coerce.number().min(1, 'currentPage must be greater than 1'),
});
