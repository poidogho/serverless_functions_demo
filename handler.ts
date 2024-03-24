import {
  getUserByIdHandler,
  getAllUsersHandler,
  updateUserHandler,
  deleteUserHandler,
  getUserPostsHandler,
  createPostHandler,
  getPostByIdHandler,
  updatePostHandler,
  searchPostsHandler,
  deletePostHandler,
} from './src/handlers';

// the expected flow is that you write your business logic somewhere in the src/handlers folder then re-export the handlers here
// for the serverless.yml file to reference.

export {
  getUserByIdHandler,
  getAllUsersHandler,
  updateUserHandler,
  deleteUserHandler,
  getUserPostsHandler,
  createPostHandler,
  getPostByIdHandler,
  updatePostHandler,
  searchPostsHandler,
  deletePostHandler,
};
