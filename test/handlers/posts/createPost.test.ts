import { createPost } from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { Broker } from '../../../src/util/event/broker';
import { TopicNames } from '../../../src/events';
import { testUsersId } from '../../../src/util/mockData';

jest.mock('../../../src/repository/base', () => {
  const originalModule = jest.requireActual('../../../src/repository/base');

  return {
    ...originalModule,
    BaseRepository: class extends originalModule.BaseRepository {
      createEntity = jest.fn().mockImplementation((data) => {
        Promise.resolve(data);
      });
    },
  };
});

afterAll(async () => {
  await closeDataSource();
});

describe('createPost', () => {
  it('should succesfully create a post for a user', async () => {
    expect.assertions(4);

    const brokerSpy = jest.spyOn(Broker.prototype, 'publish');

    const newPost = {
      userId: testUsersId.alice,
      body: 'This is a pueeebsub Body for user 2',
      title: 'Final Puddddbsub',
    };

    const result = await createPost(newPost);
    const responseBody = JSON.parse(result.body);
    expect(result.statusCode).toBe(201);
    expect(responseBody.title).toBe(newPost.title);
    expect(responseBody.body).toBe(newPost.body);
    expect(brokerSpy).toBeCalledWith(TopicNames.postCreated, {
      payload: {
        ...responseBody,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      },
      type: TopicNames.postCreated,
      version: 'v0.0.1',
    });
  });
});
