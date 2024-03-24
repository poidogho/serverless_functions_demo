import { Event } from '../types';
import { Topic } from './topic';

/**
 * The Subscriber class is responsible for listening to events of a specific type
 * published to a topic. When an event is published to the topic, the subscriber's
 * handler function is invoked with the event as its argument.
 *
 * @template T - The type of event this subscriber listens to. Must extend the base Event interface.
 */
export class Subscriber<T extends Event> {
  /**
   * Constructs a new Subscriber instance and subscribes it to a specified topic.
   * The subscriber's handler function will be called with an event object every time
   * an event of type T is published to the topic.
   *
   * @param {Topic<T>} topic - The topic to subscribe to. This topic should be an instance of the Topic class.
   * @param {(event: T) => void} handler - A function to handle incoming events. This function is called with an event of type T whenever such an event is published to the topic.
   */
  constructor(private topic: Topic<T>, handler: (event: T) => void) {
    this.topic.subscribe(handler);
  }
}
