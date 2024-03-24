import { APIGatewayEvent, Handler } from 'aws-lambda';
import {
  GetUsersReq,
  HandlerOutput,
  generateAPIGatewayEventHandler,
  jsonResp,
} from '../../util';
import { getDataSource } from '../../data-source';
import LoggerService from '../../util/logger';
import { UserService } from '../../service/user';
import { getAllUsersValidator } from '../../util/validators';

const logger = LoggerService.getInstance();

/**
 * Retrieves all users from the database.
 * This function queries the database for all records in the User table and returns them.
 * @returns {Promise<HandlerOutput>} A promise that resolves to a `HandlerOutput` object.
 * The `HandlerOutput` object contains the HTTP status code and the list of users in its body.
 */
export async function getAllUsers(
  getUsersReq: GetUsersReq
): Promise<HandlerOutput> {
  const localLog = logger.createChildLogger({});
  try {
    localLog.info(`getting all Users`);
    const { manager } = await getDataSource();
    const userService = new UserService(manager);
    const users = await userService.getAllUsers(getUsersReq);
    localLog.info('successfully got all users');

    return jsonResp(200, users);
  } catch (error) {
    const { message } = error as Error;
    localLog.error(`unable to fetch users due to error - ${message}`);
    if (message.startsWith('Users does not exist for current page')) {
      return jsonResp(400, { message });
    }
    return jsonResp(500, { message });
  }
}

export const getAllUsersHandler: Handler<APIGatewayEvent, HandlerOutput> =
  generateAPIGatewayEventHandler('GET', getAllUsers, getAllUsersValidator);
