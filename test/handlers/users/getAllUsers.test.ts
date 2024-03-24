import { getAllUsers } from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { testUsersId } from '../../../src/util/mockData';

const mockUser1 = {
  id: testUsersId.alice,
  firstName: 'Alice',
  lastName: 'one',
  birthdate: '2004-01-01T00:00:00.000Z',
  age: 20,
};

const mockUser2 = {
  id: testUsersId.bob,
  firstName: 'Bob',
  lastName: 'two',
  birthdate: '1994-01-01T00:00:00.000Z',
  age: 30,
};

const mockUsers = [mockUser1, mockUser2];

jest.mock('../../../src/repository/user', () => {
  return {
    UserRepository: class {
      findAndCount = jest.fn().mockImplementation(() => {
        return Promise.resolve([mockUsers, 2]);
      });
    },
  };
});

afterAll(async () => {
  await closeDataSource();
});

describe('getAllUser', () => {
  const queryParams = { pageSize: 10, currentPage: 1 };
  it('should return a all users', async () => {
    expect.assertions(3);
    const usersResponse = await getAllUsers(queryParams);
    expect(usersResponse.statusCode).toBe(200);
    const users = JSON.parse(usersResponse.body);
    const { result, pagesLeft } = users;
    expect(result.length).toBe(mockUsers.length);
    expect(pagesLeft).toBe(0);
  });
  it('should return users with expected properties', async () => {
    expect.assertions(5);

    const response = await getAllUsers(queryParams);
    expect(response.statusCode).toBe(200);
    const users = JSON.parse(response.body).result;
    if (users.length > 0) {
      expect(users[0]).toHaveProperty('id');
      expect(users[0]).toHaveProperty('firstName');
      expect(users[0]).toHaveProperty('lastName');
      expect(users[0]).toHaveProperty('age');
    }
  });
});
