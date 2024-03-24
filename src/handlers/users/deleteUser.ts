import { APIGatewayEvent, Handler } from 'aws-lambda';
import {
  DeleteUserReq,
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import { deleteUserValidator } from '../../util/validators';
import LoggerService from '../../util/logger';
import { UserService } from '../../service/user';
import { ErrorMessages } from '../../util/errors';

const logger = LoggerService.getInstance();
/**
 * Deletes a {@link User} by its id if it exists.
 *
 * @param {DeleteUserReq} input - The input for deleting the user, containing the `userId`.
 * @returns {Promise<HandlerOutput>} A promise that resolves to the handler output object. The handler output object
 *                                   includes the HTTP status code, headers, and a JSON stringified body.
 */
export async function deleteUser(input: DeleteUserReq): Promise<HandlerOutput> {
  const localLog = logger.createChildLogger(input);
  try {
    localLog.info('getting a user by ID');
    const { manager } = await getDataSource();
    const userService = new UserService(manager);
    const message = await userService.deleteUser(input);

    return jsonResp(200, { message });
  } catch (error) {
    const { message } = error as Error;
    localLog.error(message);
    if (message.startsWith(ErrorMessages.USER_NOT_FOUND)) {
      return jsonResp(404, { message });
    }

    return jsonResp(500, { message });
  }
}

// Handler for AWS Lambda
export const deleteUserHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('DELETE', deleteUser, deleteUserValidator);
