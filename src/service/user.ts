import { EntityManager, FindOptionsWhere } from 'typeorm';
import { UserRepository } from '../repository/user';
import { Broker } from '../util/event/broker';
import { EventBroker, TopicNames } from '../events';
import {
  DeleteUserReq,
  GetUsersReq,
  GetUsersResponse,
  UpdateUserReq,
  User,
} from '../util';
import { User as EntityUser } from '../entities/User';
import { ErrorMessages } from '../util/errors';

/**
 * Provides services for user management, including creating, updating, deleting,
 * and fetching user data. It interacts with the userRepository to persist user
 * data and utilizes an event broker to publish events related to user activities.
 * This service ensures that all user-related operations are executed as expected
 * and handles any necessary business logic.
 */
export class UserService {
  private userRepository: UserRepository;

  private eventBroker: Broker;

  private eventVersion = 'v0.0.1';

  constructor(entityManager: EntityManager) {
    this.userRepository = new UserRepository(entityManager);
    this.eventBroker = EventBroker;
  }
  /**
   * Asynchronously retrieves a user based on the specified conditions. This method
   * attempts to find a single user by applying the provided where clause(s) using
   * the userRepository. The where clause can specify one or multiple conditions to
   * match against the users in the repository.
   *
   * If a user matching the conditions is found, the user object is returned. If no
   * user matches the conditions, an error is thrown.
   *
   * @param {FindOptionsWhere<EntityUser> | FindOptionsWhere<EntityUser>[]} whereClause - The conditions to apply when searching for the user. Can be a single condition object or an array of conditions.
   * @returns {Promise<User | null>} - A promise that resolves with the user object if found, or null if no user matches the conditions.
   * @throws {Error} If no user is found matching the where clause.
   */

  async getUserById(
    whereClause: FindOptionsWhere<EntityUser> | FindOptionsWhere<EntityUser>[]
  ): Promise<User | null> {
    const user = await this.userRepository.findOneBy(whereClause);

    if (!user) {
      throw new Error(ErrorMessages.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Asynchronously retrieves a paginated list of users and the number of pages left based on the provided request parameters.
   * This method calculates the pagination based on the pageSize and currentPage specified in the request, retrieves the
   * users within the requested page, and calculates the total number of pages and how many pages are left after the current page.
   * If the currentPage is beyond the total number of pages, it throws an error indicating that there are no users for the requested page.
   *
   * @param {GetUsersReq} getUsersReq - The request object containing the pageSize and currentPage for pagination.
   * @returns {Promise<GetUsersResponse>} - A promise that resolves with an object containing the list of users for the current page
   * and the number of pages left.
   * @throws {Error} If the currentPage exceeds the total number of pages available.
   */

  async getAllUsers(getUsersReq: GetUsersReq): Promise<GetUsersResponse> {
    const { pageSize, currentPage } = getUsersReq;

    const usersAndCount = await this.userRepository.findAndCount({
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
    });

    const [result, usersCount] = usersAndCount;

    const totalPages = Math.ceil(usersCount / pageSize);
    const pageDifference = totalPages - currentPage;
    const pagesLeft = Math.max(0, pageDifference);

    if (pageDifference < 0) {
      throw new Error(`Users does not exist for current page ${currentPage}`);
    }

    return { pagesLeft, result };
  }

  /**
   * Asynchronously updates a user's information based on the provided request parameters.
   * This method first retrieves the user to be updated by their ID. If the user is found,
   * it updates the user's firstName, lastName, and birthdate with the provided values,
   * falling back to the existing values if none are provided for a field. After updating
   * the user, it publishes an event with the updated user's information using the event
   * broker. If the user is not found, it throws an error.
   *
   * @param {UpdateUserReq} updateUserReq - The request object containing the userId of the user to be updated
   * and the new values for firstName, lastName, and birthdate.
   * @returns {Promise<User>} - A promise that resolves with the updated user object.
   * @throws {Error} If the user to update is not found in the repository.
   */

  async updateUser(updateUserReq: UpdateUserReq): Promise<User> {
    const { userId, firstName, lastName, birthdate } = updateUserReq;
    const userToUpdate = await this.getUserById({ id: userId });

    if (!userToUpdate) {
      throw new Error(ErrorMessages.USER_NOT_FOUND);
    }

    const { userUpdated } = TopicNames;

    const payload = {
      ...userToUpdate,
      firstName: firstName ?? userToUpdate.firstName,
      lastName: lastName ?? userToUpdate.lastName,
      birthdate: birthdate ?? userToUpdate.birthdate,
    };

    this.eventBroker.publish(userUpdated, {
      payload,
      version: this.eventVersion,
      type: userUpdated,
    });

    return payload;
  }

  /**
   * Asynchronously deletes a user based on the provided request parameters.
   * This method first finds the user by ID using the userRepository. If the user
   * is found, it proceeds to delete the user and publish an event indicating the
   * deletion with the event broker. If the user is not found, it throws an error.
   *
   * @param {DeleteUserReq} input - The request object containing the userId of the user to be deleted.
   * @returns {Promise<string>} - A promise that resolves with a success message upon successful deletion.
   * @throws {Error} If the user is not found in the repository.
   */
  async deleteUser(input: DeleteUserReq): Promise<string> {
    const user = await this.userRepository.findOneBy({ id: input.userId });

    if (!user) {
      throw new Error(ErrorMessages.USER_NOT_FOUND);
    }

    const { userDeleted } = TopicNames;

    const payload = {
      ...user,
    };

    this.eventBroker.publish(userDeleted, {
      payload,
      version: this.eventVersion,
      type: userDeleted,
    });

    return 'User successfully deleted';
  }
}
