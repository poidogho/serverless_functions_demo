import { APIGatewayEvent, Handler } from 'aws-lambda';
import {
  CreatePostInput,
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import { PostService } from '../../service/post';
import { createPostValidator } from '../../util/validators';
import LoggerService from '../../util/logger';
import { ErrorMessages } from '../../util/errors';

const logger = LoggerService.getInstance();

/**
 * Creates a new post using the provided input data. This function initializes the
 * post service with the current database manager, then uses that service to create
 * a post.
 *
 * @param {CreatePostInput} input The data needed to create a new post
 * @returns {Promise<HandlerOutput>} A promise that resolves with the HTTP response
 * object, containing the status code and the newly created post.
 */
export async function createPost(
  input: CreatePostInput
): Promise<HandlerOutput> {
  const localLog = logger.createChildLogger(input);
  try {
    localLog.info('Creating a post');
    const { manager } = await getDataSource();
    const postService = new PostService(manager);
    const savedPost = await postService.createPost(input);

    return jsonResp(201, savedPost);
  } catch (error) {
    const { message } = error as Error;
    localLog.error(message);
    if (message.startsWith(ErrorMessages.POST_ALREADY_EXIST)) {
      return jsonResp(409, { message });
    }

    return jsonResp(500, { message });
  }
}

export const createPostHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('POST', createPost, createPostValidator);
