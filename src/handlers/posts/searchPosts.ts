import { APIGatewayEvent, Handler } from 'aws-lambda';
import {
  HandlerOutput,
  SearchPostsInput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import LoggerService from '../../util/logger';
import { PostService } from '../../service/post';
import { searchPostsValidator } from '../../util/validators';

const logger = LoggerService.getInstance();

/**
 * Gets a {@link Post} Posts
 * @param input
 * @returns {Promise<HandlerOutput>} A promise that resolves to a `HandlerOutput` object.
 * The `HandlerOutput` object contains the HTTP status code and the list of posts
 * and remainining pages in its body.
 */
export async function searchPosts(
  input: SearchPostsInput
): Promise<HandlerOutput> {
  const localLog = logger.createChildLogger(input);
  try {
    localLog.info('Fetching Posts');
    const { manager } = await getDataSource();
    const postService = new PostService(manager);
    const posts = await postService.searchPosts(input);

    localLog.info('Posts successfully fetched');
    return jsonResp(200, posts);
  } catch (error) {
    const { message } = error as Error;
    localLog.error(message);
    if (message.startsWith('No Posts Found for Title with id')) {
      return jsonResp(404, { message });
    }
    return jsonResp(500, { message });
  }
}

export const searchPostsHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('POST', searchPosts, searchPostsValidator);
