import { APIGatewayEvent, Handler } from 'aws-lambda';
import {
  HandlerOutput,
  UpdatePostInput,
  generateAPIGatewayEventHandler,
  jsonResp,
  updatePostValidator,
} from '../../util';
import { getDataSource } from '../../data-source';
import LoggerService from '../../util/logger';
import { PostService } from '../../service/post';
import { ErrorMessages } from '../../util/errors';

const logger = LoggerService.getInstance();

export async function updatePost(
  input: UpdatePostInput
): Promise<HandlerOutput> {
  const localLog = logger.createChildLogger(input);
  try {
    localLog.info(`Updating post with id - ${input.postId}`);
    const { manager } = await getDataSource();
    const postService = new PostService(manager);
    const updatedPost = await postService.updatePost(input);

    return jsonResp(200, updatedPost);
  } catch (error) {
    const { message } = error as Error;
    localLog.error(message);
    if (message.startsWith(ErrorMessages.POST_NOT_FOUND)) {
      return jsonResp(404, { message });
    }
    return jsonResp(500, { message });
  }
}

export const updatePostHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('PATCH', updatePost, updatePostValidator);
