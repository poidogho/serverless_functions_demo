/* eslint-disable max-classes-per-file */
import { getUserPosts } from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { testUsersId } from '../../../src/util/mockData';

const mockUser = {
  id: testUsersId.alice,
  firstName: 'Alice',
  lastName: 'one',
  birthdate: '2004-01-01T00:00:00.000Z',
  age: 20,
};

const findAndCountRes = [
  [
    {
      id: 'a1280a7d-3719-4064-bd9b-d097a59aeb1d',
      userId: testUsersId.alice,
      title: 'Title 1 for User 1',
      body: 'Body 1 for User 1',
      created_at: '2024-03-16T02:11:08.000Z',
      updated_at: '2024-03-16T02:11:08.000Z',
    },
    {
      id: '4a476366-17d9-4cb5-b444-f3f0f730c28c',
      userId: testUsersId.alice,
      title: 'Title 2 for User 1',
      body: 'Body 2 for User 1',
      created_at: '2024-03-16T02:11:08.000Z',
      updated_at: '2024-03-16T02:11:08.000Z',
    },
    {
      id: 'c97b1526-7fa7-41a9-bef2-98a8d3bf2a79',
      userId: testUsersId.alice,
      title: 'Title 3 for User 1',
      body: 'Body 3 for User 1',
      created_at: '2024-03-16T02:11:08.000Z',
      updated_at: '2024-03-16T02:11:08.000Z',
    },
    {
      id: 'd7eafdd1-8c3c-4bb8-a6e5-416f49b6b28e',
      userId: testUsersId.alice,
      title: 'Title 4 for User 1',
      body: 'Body 4 for User 1',
      created_at: '2024-03-16T02:11:08.000Z',
      updated_at: '2024-03-16T02:11:08.000Z',
    },
    {
      id: 'f1676d3d-5b94-45d9-bea1-37f8801151c0',
      userId: testUsersId.alice,
      title: 'Title 5 for User 1',
      body: 'Body 5 for User 1',
      created_at: '2024-03-16T02:11:08.000Z',
      updated_at: '2024-03-16T02:11:08.000Z',
    },
  ],
  5,
];

jest.mock('../../../src/repository/post', () => {
  return {
    PostRepository: class {
      findAndCount = jest.fn().mockImplementation((options) => {
        if (options.where.userId === testUsersId.alice) {
          return Promise.resolve(findAndCountRes);
        }
        return Promise.resolve([[], 0]);
      });
    },
  };
});

jest.mock('../../../src/repository/user', () => {
  return {
    UserRepository: class {
      findOneBy = jest.fn().mockImplementation(() => {
        return Promise.resolve(mockUser);
      });
    },
  };
});

afterAll(async () => {
  await closeDataSource();
});

describe('getUserPosts', () => {
  it('should return posts and pages left for a valid user', async () => {
    expect.assertions(1);
    const input = {
      userId: testUsersId.alice,
      pageSize: 10,
      currentPage: 1,
    };

    const response = await getUserPosts(input);
    expect(response.statusCode).toBe(200);
  });

  it('should return a 404 status when no posts are found for the user', async () => {
    expect.assertions(2);
    const input = {
      userId: '3b2bc752-66c2-4fd6-afd8-16125ea21cc9',
      pageSize: 2,
      currentPage: 1,
    };

    const expectedFailResult = {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: `Posts does not exist for current page ${input.currentPage}`,
      }),
    };

    const result = await getUserPosts(input);
    expect(result.statusCode).toBe(400);
    expect(result).toStrictEqual(expectedFailResult);
  });
});
