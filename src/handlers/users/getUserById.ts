import { APIGatewayEvent, Handler } from 'aws-lambda';
import { z } from 'zod';
import {
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import LoggerService from '../../util/logger';
import { UserService } from '../../service/user';
import { ErrorMessages } from '../../util/errors';

const logger = LoggerService.getInstance();

// Here we write a validator that ensures the path/query/body parameters we receive for a request match what we expect
// The framework will automatically return a 400 series error for you if the request doesn't match this validator.
// URI parameters are spread automatically into one object for you which is how userId in this validator validates the
//  userId in the /users/{userId} URI for this handler
export const getUserByIdValidator = z.object({
  userId: z.coerce.string(),
});

export type GetUserByIdInput = z.infer<typeof getUserByIdValidator>;

/**
 * Gets a {@link User} by its id if it exists
 * @param input
 */
export async function getUserById(
  input: GetUserByIdInput
): Promise<HandlerOutput> {
  const localLog = logger.createChildLogger(input);
  try {
    localLog.info('getting a user by ID');
    const { manager } = await getDataSource();
    const userService = new UserService(manager);
    const user = await userService.getUserById({ id: input.userId });

    return jsonResp(200, user);
  } catch (error) {
    const { message } = error as Error;
    localLog.error(message);
    if (message.startsWith(ErrorMessages.USER_NOT_FOUND)) {
      return jsonResp(404, { message });
    }

    return jsonResp(500, { message });
  }
}

// We separate the serverless side from the logic side to allow for handlers to be tested without a http context
// the generateAPIGatewayEventHandler method will take a function and serverless-ify it for you
export const getUserByIdHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('GET', getUserById, getUserByIdValidator);
