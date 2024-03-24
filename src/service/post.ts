import { EntityManager, FindOneOptions, FindOptionsWhere } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../entities/Post';
import { PostRepository } from '../repository/post';
import { UserRepository } from '../repository/user';
import {
  CreatePostInput,
  GetUserPostsInput,
  GetUserPostsResponse,
} from '../util';
import { EventBroker, TopicNames } from '../events';
import {
  GetPostByIdReq,
  SearchPostsInput,
  Post as TPost,
  UpdatePostInput,
} from '../util/types';
import { Broker } from '../util/event/broker';
import { ErrorMessages } from '../util/errors';

/**
 * The PostService class provides methods for managing posts within the application.
 * It handles operations such as creating, updating, deleting, and fetching posts,
 * utilizing the PostRepository for database interactions. Additionally, it interacts
 * with the UserRepository for user-related validations and the event broker for
 * publishing events related to post operations. This service encapsulates the
 * business logic for post management and ensures the application's post-related
 * functionality is executed appropriately.
 *
 */

export class PostService {
  private postRepository: PostRepository;

  private userRepository: UserRepository;

  private eventBroker: Broker;

  private eventVersion = 'v0.0.1';

  constructor(entityManager: EntityManager) {
    this.postRepository = new PostRepository(entityManager);
    this.userRepository = new UserRepository(entityManager);
    this.eventBroker = EventBroker;
  }

  /**
   * Asynchronously retrieves a post by its ID using the specified options. The method
   * calls the postRepository's findById function, which is designed to find a single
   * post based on the provided findOneOptions. These options may include conditions,
   * relations, select fields, and other query modifiers specific to the retrieval of
   * the post.
   *
   * This approach allows for precise control over the query, enabling the inclusion of
   * related entities or the filtering of specific fields as needed. If a post matching
   * the provided options is found, it is returned; otherwise, null is returned to indicate
   * that no such post could be found.
   *
   * @param {FindOneOptions<Post>} options - The options object specifying how the post should be found. This can include conditions on the post's fields, relations to include, and other query parameters.
   * @returns {Promise<Post | null>} - A promise that resolves with the found post object if a match is found, or null if no match is found.
   */

  async getPostById(options: FindOneOptions<Post>): Promise<Post | null> {
    return this.postRepository.findById(options);
  }

  /**
   * Asynchronously retrieves a single post based on the specified search criteria.
   * This method utilizes the postRepository's getUserPost function, which expects
   * a set of conditions to find a specific post. The options parameter allows for
   * flexible queries based on the Post model's attributes, such as post ID and user ID.
   *
   * This method is designed to fetch a post that matches the given criteria exactly.
   * If a matching post is found, it is returned; otherwise, null is returned to indicate
   * that no matching post could be found.
   *
   * @param {FindOptionsWhere<Post>} options - The search criteria used to find the post. This can include any attributes of the Post model, such as id or userId.
   * @returns {Promise<Post | null>} - A promise that resolves with the found post object if a match is found, or null if no match is found.
   */

  async getUserPost(options: FindOptionsWhere<Post>): Promise<Post | null> {
    return this.postRepository.getUserPost(options);
  }

  /**
   * Asynchronously updates the details of an existing post identified by postId and userId.
   * The method first retrieves the post to ensure it exists and is owned by the user. If the
   * post is found, it updates the post's title and body with the provided values, falling back
   * to the existing values if none are provided for these fields. After updating the post, it
   * publishes a postUpdated event with the updated post's information to notify other parts of
   * the application about the update.
   *
   * If the specified post does not exist or does not belong to the user, it throws an error
   * indicating the post was not found.
   *
   * @param {UpdatePostInput} updatePostReq - The request object containing the postId, userId, and the new values for the post's title and body.
   * @returns {Promise<TPost>} - A promise that resolves with the updated post object.
   * @throws {Error} If the post to be updated is not found or does not belong to the user.
   */

  async updatePost(updatePostReq: UpdatePostInput): Promise<TPost> {
    const { postId, body, title, userId } = updatePostReq;
    const post = await this.postRepository.findOneBy({ id: postId, userId });

    if (!post) {
      throw new Error(ErrorMessages.POST_NOT_FOUND);
    }

    const { postUpdated } = TopicNames;

    const payload = {
      ...post,
      title: title ?? post.title,
      body: body ?? post.body,
    };

    this.eventBroker.publish(postUpdated, {
      payload,
      version: this.eventVersion,
      type: postUpdated,
    });

    return payload;
  }

  /**
   * Asynchronously deletes a specific post identified by its id and the userId of its author.
   * Before deletion, it verifies the existence of the post by calling getUserPost with the
   * post's id and the userId. If the post exists, it proceeds to delete the post and then
   * publishes a postDeleted event with the post's id as the payload to notify other parts
   * of the application about the deletion.
   *
   * If the specified post does not exist, it throws an error indicating the post was not found.
   *
   * @param {string} id - The unique identifier of the post to be deleted.
   * @param {string} userId - The userId of the author of the post to ensure that only the author can delete the post.
   * @returns {Promise<void>} - A promise that resolves when the post is successfully deleted.
   * @throws {Error} If the post to be deleted is not found.
   */

  async deletePost(id: string, userId: string): Promise<void> {
    const userPost = this.getUserPost({ id, userId });

    if (!userPost) {
      throw new Error(ErrorMessages.POST_NOT_FOUND);
    }

    const { postDeleted } = TopicNames;
    const payload = id;

    this.eventBroker.publish(postDeleted, {
      payload,
      version: this.eventVersion,
      type: postDeleted,
    });
  }

  /**
   * Asynchronously searches for posts that match the specified search criteria. This method
   * leverages the postRepository's searchPosts function, passing it the searchClause which
   * contains the criteria for the search. The search can be based on various attributes of
   * the posts, as defined in the SearchPostsInput type.
   *
   * If matching posts are found, an array of Post objects is returned. If no posts match the
   * search criteria, the method throws an error indicating no posts were found.
   *
   * @param {SearchPostsInput} searchClause - The criteria used to search for posts. This includes attributes such as title, tags, author, etc.
   * @returns {Promise<Post[] | null>} - A promise that resolves with an array of Post objects that match the search criteria, or null if no posts are found.
   * @throws {Error} If no posts match the search criteria.
   */

  async searchPosts(searchClause: SearchPostsInput): Promise<Post[] | null> {
    const posts = await this.postRepository.searchPosts(searchClause);

    if (!posts) {
      throw new Error(
        `No Posts Found for Title with id ${searchClause.title}!`
      );
    }

    return posts;
  }

  /**
   * Asynchronously creates a new post based on the provided input. Before creating the post,
   * it checks to ensure that a post with the same title by the same user does not already exist.
   * If such a post exists, it throws an error. Otherwise, it generates a unique identifier for the
   * new post, sets the creation and update timestamps to the current time, and constructs the post
   * object. After the post object is created, it publishes an event indicating the creation of the
   * post using the event broker.
   *
   * This method uses a UUID for the post ID and sets both the created_at and updated_at fields to
   * the current date and time.
   *
   * @param {CreatePostInput} post - The input object containing the userId and title for the new post.
   * @returns {Promise<TPost>} - A promise that resolves with the newly created post object.
   * @throws {Error} If a post with the same title by the same user already exists.
   */

  async createPost(post: CreatePostInput): Promise<TPost> {
    const { userId, title } = post;
    const existingPost = await this.getUserPost({ userId, title });

    if (existingPost) {
      throw new Error(ErrorMessages.POST_ALREADY_EXIST);
    }

    const { postCreated } = TopicNames;

    const id = uuidv4();
    const now = new Date();
    const payload = { ...post, id, created_at: now, updated_at: now };

    this.eventBroker.publish(postCreated, {
      payload,
      version: this.eventVersion,
      type: postCreated,
    });

    return payload;
  }

  /**
   * Asynchronously retrieves the posts of a specific user based on the given request parameters.
   * This method concurrently fetches the user's posts and the user's details to ensure the user
   * exists before attempting to get their posts. It applies pagination to the results based on
   * the pageSize and currentPage specified in the request.
   *
   * If the user is found and they have posts, it calculates the total number of pages and how
   * many pages are left after the current page. If the user is not found, it throws an error
   * indicating the user does not exist. Similarly, if no posts are found for the user, or if
   * the requested page number exceeds the total number of pages, it throws an error.
   *
   * @param {GetUserPostsInput} userPostRequest - The request object containing the userId, pageSize, and currentPage.
   * @returns {Promise<GetUserPostsResponse>} - A promise that resolves with the user's posts and pagination info (pages left, total pages, etc.).
   * @throws {Error} If the user is not found, no posts are found for the user, or the requested page number is out of range.
   */

  async getUserPosts(
    userPostRequest: GetUserPostsInput
  ): Promise<GetUserPostsResponse> {
    const { pageSize, currentPage, userId } = userPostRequest;

    const [postsResult, user] = await Promise.all([
      this.postRepository.findAndCount({
        where: { userId },
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
      }),
      this.userRepository.findOneBy({ id: userId }),
    ]);

    const [result, pageCount] = postsResult;

    if (!user) {
      throw new Error(ErrorMessages.USER_NOT_FOUND);
    }

    if (!result) {
      throw new Error(`No Posts Found for User with id ${userId}!`);
    }
    const totalPages = Math.ceil(pageCount / pageSize);
    const pageDifference = totalPages - currentPage;
    const pagesLeft = Math.max(0, pageDifference);

    if (pageDifference < 0) {
      throw new Error(`Posts does not exist for current page ${currentPage}`);
    }

    return { pagesLeft, result };
  }

  /**
   * Asynchronously retrieves a post by its ID.
   *
   * @param {GetPostByIdReq} getPostReq - The request object containing the ID of the post to retrieve.
   * @returns {Promise<Post>} A promise that resolves with the retrieved post object.
   * @throws {Error} Throws an error if the post is not found.
   */
  async getPost(getPostReq: GetPostByIdReq): Promise<Post> {
    const post = await this.postRepository.findOneBy({ id: getPostReq.postId });
    if (!post) {
      throw new Error(ErrorMessages.POST_NOT_FOUND);
    }
    return post;
  }
}
