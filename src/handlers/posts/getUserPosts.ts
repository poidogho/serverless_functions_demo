import { APIGatewayEvent, Handler } from 'aws-lambda';
import {
  GetUserPostsInput,
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import { PostService } from '../../service/post';
import { getUserPostsValidator } from '../../util/validators';
import LoggerService from '../../util/logger';
import { ErrorMessages } from '../../util/errors';

const logger = LoggerService.getInstance();

/**
 * Gets a {@link Post} Posts
 * @param input
 * @returns {Promise<HandlerOutput>} A promise that resolves to a `HandlerOutput` object.
 * The `HandlerOutput` object contains the HTTP status code and the list of posts by a user
 * and remainining pages in its body.
 */
export async function getUserPosts(
  input: GetUserPostsInput
): Promise<HandlerOutput> {
  const localLog = logger.createChildLogger(input);
  try {
    localLog.info('Fetching User Posts');
    const { manager } = await getDataSource();
    const postService = new PostService(manager);
    const userPosts = await postService.getUserPosts(input);

    localLog.info('User Posts succefully fetched');
    return jsonResp(200, userPosts);
  } catch (error) {
    const { message } = error as Error;
    if (
      message.startsWith('No Posts Found for User with id') ||
      message.startsWith(ErrorMessages.USER_NOT_FOUND)
    ) {
      return jsonResp(404, { message });
    }
    if (message.startsWith('Posts does not exist for')) {
      return jsonResp(400, { message });
    }
    return jsonResp(500, { message });
  }
}

export const getUserPostsHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('GET', getUserPosts, getUserPostsValidator);
