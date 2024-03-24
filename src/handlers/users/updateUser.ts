import { APIGatewayEvent, Handler } from 'aws-lambda';
import {
  HandlerOutput,
  UpdateUserReq,
  generateAPIGatewayEventHandler,
  jsonResp,
  updateUserValidator,
} from '../../util';
import { getDataSource } from '../../data-source';
import LoggerService from '../../util/logger';
import { UserService } from '../../service/user';
import { ErrorMessages } from '../../util/errors';

const logger = LoggerService.getInstance();

/**
 * Updates the specified fields (`firstName`, `lastName`, and `age`) of a user identified by `userId`.
 * If the user cannot be found, it returns a 404 error response.
 *
 * @param {UpdateUserInput} input - The input for updating the user, containing the `userId` and the fields to be updated.
 *                                  The `UpdateUserInput` type is expected to have `userId` as a string, and `firstName`,
 *                                  `lastName`, and `age` as optional fields. Other fields are not updated even if provided.
 * @returns {Promise<HandlerOutput>} A promise that resolves to the handler output object. The handler output object
 *                                   includes the HTTP status code, headers, and a JSON stringified body. T
 */
export async function updateUser(input: UpdateUserReq): Promise<HandlerOutput> {
  const localLog = logger.createChildLogger({});
  try {
    localLog.info(`updating a user`);
    const { manager } = await getDataSource();
    const userService = new UserService(manager);
    const updatedUser = await userService.updateUser(input);
    localLog.info(`succesfully updated user - ${input.userId}`);

    return jsonResp(200, updatedUser);
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
export const updateUserHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('PATCH', updateUser, updateUserValidator);
