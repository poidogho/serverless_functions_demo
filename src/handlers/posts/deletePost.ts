import { APIGatewayEvent, Handler } from 'aws-lambda';
import {
  DeletePostInput,
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import { deletePostValidator } from '../../util/validators';
import LoggerService from '../../util/logger';
import { PostService } from '../../service/post';
import { ErrorMessages } from '../../util/errors';

const logger = LoggerService.getInstance();

/**
 * Deletes a {@link Post} by its id if it exists.
 *
 * @param {DeletePostInput} input - The input for deleting the Post, containing the `userId`.
 * @returns {Promise<HandlerOutput>} A promise that resolves to the handler output object. The handler output object
 *                                   includes the HTTP status code, headers, and a JSON stringified body.
 */
export async function deletePost(
  input: DeletePostInput
): Promise<HandlerOutput> {
  const localLog = logger.createChildLogger(input);
  const { postId, userId } = input;
  try {
    localLog.info(
      `Deleting Post with id - ${postId} by user with id -${userId}`
    );
    const { manager } = await getDataSource();
    const postService = new PostService(manager);
    await postService.deletePost(postId, userId);

    return jsonResp(200, { message: 'Post successfully deleted' });
  } catch (error) {
    const { message } = error as Error;
    localLog.error(message);
    if (message.startsWith(ErrorMessages.POST_NOT_FOUND)) {
      return jsonResp(404, { message });
    }
    return jsonResp(500, { message });
  }
}

// Handler for AWS Lambda
export const deletePostHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('DELETE', deletePost, deletePostValidator);
