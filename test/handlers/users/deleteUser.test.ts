/* eslint-disable max-classes-per-file */
import { deleteUser } from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { testUsersId, mockNonExistigUserId } from '../../../src/util/mockData';
import { ErrorMessages } from '../../../src/util/errors';

const mockUser = {
  id: testUsersId.alice,
  firstName: 'Alice',
  lastName: 'one',
  birthdate: '2004-01-01T00:00:00.000Z',
  age: 20,
};
jest.mock('../../../src/repository/user', () => {
  return {
    UserRepository: class {
      findOneBy = jest.fn().mockImplementation((options) => {
        if (options.id === testUsersId.alice) {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(null);
      });

      delete = jest.fn().mockImplementation(() => {
        return Promise.resolve({});
      });
    },
  };
});

jest.mock('../../../src/repository/post', () => {
  return {
    PostRepository: class {
      delete = jest.fn().mockImplementation(() => {
        return Promise.resolve({});
      });
    },
  };
});

afterAll(async () => {
  await closeDataSource();
});

describe('deleteUser', () => {
  it('should successfully delete a user and return a success message', async () => {
    expect.assertions(1);

    const deleteInput = {
      userId: testUsersId.alice,
    };

    const result = await deleteUser(deleteInput);

    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'User successfully deleted' }),
    });
  });

  it('should return a 404 error when trying to delete a user that does not exist', async () => {
    expect.assertions(1);

    const deleteInput = {
      userId: mockNonExistigUserId,
    };

    const result = await deleteUser(deleteInput);

    expect(result).toStrictEqual({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: ErrorMessages.USER_NOT_FOUND }),
    });
  });
});
