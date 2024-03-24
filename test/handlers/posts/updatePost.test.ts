/* eslint-disable max-classes-per-file */
import { updatePost } from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { Broker } from '../../../src/util/event/broker';
import { TopicNames } from '../../../src/events';
import { testUsersId } from '../../../src/util/mockData';

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
      save = jest.fn().mockImplementation(() => {
        return Promise.resolve({});
      });

      findOneBy = jest.fn().mockImplementation(() => {
        return Promise.resolve(mockPost);
      });
    },
  };
});

afterAll(async () => {
  await closeDataSource();
});

describe('createPost', () => {
  it('should succesfully update a user post', async () => {
    expect.assertions(2);

    const brokerSpy = jest.spyOn(Broker.prototype, 'publish');

    const result = await updatePost({
      postId: mockPost.id,
      userId: mockPost.userId,
      title: 'updated Title',
      body: 'updated body',
    });

    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);
    const payload = {
      ...mockPost,
      title: responseBody?.title ?? mockPost.title,
      body: responseBody.body ?? mockPost.body,
    };

    expect(brokerSpy).toBeCalledWith(TopicNames.postUpdated, {
      payload,
      type: TopicNames.postUpdated,
      version: 'v0.0.1',
    });
  });
});
