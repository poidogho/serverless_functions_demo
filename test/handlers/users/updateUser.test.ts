// eslint-disable-next-line max-classes-per-file
import { updateUser } from '../../../src/handlers';
import { closeDataSource } from '../../../src/data-source';
import { Broker } from '../../../src/util/event/broker';
import { TopicNames } from '../../../src/events';
import { testUsersId } from '../../../src/util/mockData';
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

      save = jest.fn().mockImplementation((data) => {
        Promise.resolve(data);
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

describe('updateUser', () => {
  it('should update the user and return the updated user details', async () => {
    expect.assertions(2);
    const brokerSpy = jest.spyOn(Broker.prototype, 'publish');

    const updateInput = {
      userId: testUsersId.alice,
      firstName: 'UpdatedFirstName',
      lastName: 'UpdatedLastName',
    };

    const result = await updateUser(updateInput);
    const responseBody = JSON.parse(result.body);

    expect(result).toStrictEqual({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: testUsersId.alice,
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        birthdate: '2004-01-01T00:00:00.000Z',
        age: 20,
      }),
    });
    expect(brokerSpy).toBeCalledWith(TopicNames.userUpdated, {
      payload: {
        ...responseBody,
        birthdate: '2004-01-01T00:00:00.000Z',
      },
      type: TopicNames.userUpdated,
      version: 'v0.0.1',
    });
  });

  it('should return a 404 error if the user does not exist', async () => {
    expect.assertions(1);

    const updateInput = {
      userId: '3b2bc752-66c2-4fd6-afd8-16125ea21cc9',
      firstName: 'NonExistentUserFirstName',
      lastName: 'NonExistentUserLastName',
      age: 30,
    };

    const result = await updateUser(updateInput);

    expect(result).toStrictEqual({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: ErrorMessages.USER_NOT_FOUND }),
    });
  });
});
