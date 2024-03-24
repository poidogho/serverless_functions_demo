import { getUserById } from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { testUsersId } from '../../../src/util/mockData';

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

afterAll(async () => {
  await closeDataSource();
});

describe('getUserById', () => {
  it('should return a 404 for a non existent id', async () => {
    expect.assertions(1);

    const result = await getUserById({
      userId: '3b2bc752-66c2-4fd6-afd8-16125ea21cc9',
    });

    expect(result).toStrictEqual({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: '{"message":"User not found"}',
    });
  });

  it('should return the user as expected for known to exist users', async () => {
    expect.assertions(2);

    const result = await getUserById({
      userId: testUsersId.alice,
    });

    expect(result.statusCode).toBe(200);

    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: testUsersId.alice,
        firstName: 'Alice',
        lastName: 'one',
        birthdate: '2004-01-01T00:00:00.000Z',
        age: 20,
      }),
    });
  });
});
