import { Broker } from '../util/event/broker';
import { initializeSubscribers } from './subscribers';

export const EventBroker = new Broker();
export const TopicNames = {
  postCreated: 'POST_CREATED',
  postUpdated: 'POST_UPDATED',
  postDeleted: 'POST_DELETED',

  userCreated: 'USER_CREATED',
  userUpdated: 'USER_UPDATED',
  userDeleted: 'USER_DELETED',
};

initializeSubscribers({ EventBroker, TopicNames });
