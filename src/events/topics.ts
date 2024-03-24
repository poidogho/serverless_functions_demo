import { Broker } from '../util/event/broker';
import { Event } from '../util/types';

export type Opts = {
  EventBroker: Broker;
  TopicNames: Record<string, string>;
};

export const registerTopics = (options: Opts) => {
  const { EventBroker, TopicNames } = options;

  // Post topics
  EventBroker.createTopic<Event>(TopicNames.postCreated);
  EventBroker.createTopic<Event>(TopicNames.postUpdated);
  EventBroker.createTopic<Event>(TopicNames.postDeleted);

  // User topics
  EventBroker.createTopic<Event>(TopicNames.userCreated);
  EventBroker.createTopic<Event>(TopicNames.userUpdated);
  EventBroker.createTopic<Event>(TopicNames.userDeleted);
};
