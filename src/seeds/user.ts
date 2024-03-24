import { EntityManager } from 'typeorm';
import LoggerService from '../util/logger';
import { UserRepository } from '../repository/user';
import { testUsersId } from '../util/mockData';

/**
 * Seeds the database with initial user data for testing or development purposes.
 * This function defines a set of users with attributes such as id, firstName, lastName,
 * and birthdate. It then iterates over this list, using the UserRepository to create user
 * entities in the database. Once all users are seeded, it logs a message indicating the
 * successful completion of the operation.
 *
 * @param {EntityManager} manager - The entity manager that provides access to the database and repositories.
 */

const userSeed = async (manager: EntityManager) => {
  const logger = LoggerService.getInstance();
  const userRepository = new UserRepository(manager);

  const users = [
    {
      id: testUsersId.alice,
      firstName: 'Alice',
      lastName: 'one',
      birthdate: new Date('2004-01-01T00:00:00.000Z'),
    },
    {
      id: testUsersId.bob,
      firstName: 'Bob',
      lastName: 'two',
      birthdate: new Date('1994-01-01T00:00:00.000Z'),
    },
    {
      id: testUsersId.candice,
      firstName: 'Candice',
      lastName: 'three',
      birthdate: new Date('1984-01-01T00:00:00.000Z'),
    },
    {
      id: testUsersId.derek,
      firstName: 'Derek',
      lastName: 'four',
      birthdate: new Date('1974-01-01T00:00:00.000Z'),
    },
    {
      id: testUsersId.john,
      firstName: 'John',
      lastName: 'five',
      birthdate: new Date('1995-01-01T00:00:00.000Z'),
    },
    {
      id: testUsersId.david,
      firstName: 'David',
      lastName: 'Six',
      birthdate: new Date('1967-01-01T00:00:00.000Z'),
    },
    {
      id: testUsersId.tes,
      firstName: 'Tes',
      lastName: 'seven',
      birthdate: new Date('1945-01-01T00:00:00.000Z'),
    },
  ];

  await Promise.all(
    users.map((user) => {
      return userRepository.createEntity(user);
    })
  );
  logger.info('Users have been seeded');
};

export default userSeed;
