import { getPostById } from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { testUsersId } from '../../../src/util/mockData';
import { ErrorMessages } from '../../../src/util/errors';

const mockPost = {
  id: '7c2184c4-0c5a-4ea2-9ee1-c255824aa4b0',
  userId: testUsersId.alice,
  title: 'mock title',
  body: 'mock body',
  created_at: '2024-03-19T19:01:16.508Z',
  updated_at: '2024-03-19T19:01:16.508Z',
};

jest.mock('../../../src/repository/post', () => {
  return {
    PostRepository: class {
      findOneBy = jest.fn().mockImplementation((option) => {
        if (option.id === mockPost.id) {
          return Promise.resolve(mockPost);
        }
        return Promise.resolve(null);
      });
    },
  };
});

afterAll(async () => {
  await closeDataSource();
});

describe('getPostById', () => {
  it('should return a posts', async () => {
    expect.assertions(1);
    const input = {
      postId: mockPost.id,
    };

    const response = await getPostById(input);
    expect(response.statusCode).toBe(200);
  });

  it('should return a 404 status when a post is not found', async () => {
    expect.assertions(2);
    const input = {
      postId: '0b3c8f08-b201-4a64-8c71-3fdb07a40ff8',
    };

    const expectedFailResult = {
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: `${ErrorMessages.POST_NOT_FOUND}`,
      }),
    };

    const result = await getPostById(input);
    expect(result.statusCode).toBe(404);
    expect(result).toStrictEqual(expectedFailResult);
  });
});
