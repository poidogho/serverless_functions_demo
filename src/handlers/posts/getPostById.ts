import { APIGatewayEvent, Handler } from 'aws-lambda';
import {
  GetPostByIdReq,
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import { getPostByIdValidator } from '../../util/validators';
import LoggerService from '../../util/logger';
import { PostService } from '../../service/post';
import { ErrorMessages } from '../../util/errors';

const logger = LoggerService.getInstance();
/**
 * Gets a {@link Post} by its id if it exists
 * @param input
 */
export async function getPostById(
  input: GetPostByIdReq
): Promise<HandlerOutput> {
  const localLog = logger.createChildLogger(input);
  try {
    localLog.info('Fetching User Posts');
    const { manager } = await getDataSource();
    const postService = new PostService(manager);
    const userPosts = await postService.getPost(input);

    localLog.info(`Post with id -${input.postId}succefully fetched`);
    return jsonResp(200, userPosts);
  } catch (error) {
    const { message } = error as Error;
    if (message.startsWith(ErrorMessages.POST_NOT_FOUND)) {
      return jsonResp(404, { message });
    }
    return jsonResp(500, { message });
  }
}

export const getPostByIdHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('GET', getPostById, getPostByIdValidator);
