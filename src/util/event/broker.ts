import { Event } from '../types';
import { Subscriber } from './subscriber';
import { Topic } from './topic';

/**
 * A Broker class for managing topics and facilitating event-driven communication
 * between publishers and subscribers.
 */
export class Broker {
  private topics: Map<string, Topic<Event>> = new Map();

  /**
   * Creates a new topic or returns an existing one by its name.
   *
   * @param {string} topicName - The name of the topic to create or retrieve.
   * @returns {Topic<Event>} The topic instance associated with the given name.
   */
  createTopic<T extends Event>(topicName: string): Topic<Event> {
    if (!this.topics.has(topicName)) {
      const topic = new Topic<Event>();
      this.topics.set(topicName, topic);
    }
    return this.topics.get(topicName) as Topic<Event>;
  }

  /**
   * Publishes an event to a specific topic, optionally with a delay.
   *
   * @param {string} topicName - The name of the topic to which the event will be published.
   * @param {Event} event - The event object to be published.
   * @param {number} [delayMs=0] - The delay in milliseconds before the event is published. Defaults to 0 for immediate publishing.
   */
  publish(topicName: string, event: Event, delayMs = 0): void {
    const topic = this.topics.get(topicName);
    if (topic) {
      if (delayMs > 0) {
        setTimeout(() => {
          topic.publish(event);
        }, delayMs);
      } else {
        topic.publish(event);
      }
    } else {
      console.warn(`Topic ${topicName} does not exist.`);
    }
  }

  /**
   * Subscribes a handler to a topic to receive its events.
   *
   * @param {string} topicName - The name of the topic to subscribe to.
   * @param {(event: Event) => void} handler - The function to be called when an event is published to the topic.
   * @returns {Subscriber<Event>} A Subscriber instance representing the subscription.
   * @throws {Error} If the topic does not exist.
   */
  subscribe(
    topicName: string,
    handler: (event: Event) => void
  ): Subscriber<Event> {
    const topic = this.topics.get(topicName) as Topic<Event>;
    if (topic) {
      return new Subscriber(topic, handler);
    }

    throw new Error(`Topic ${topicName} does not exist.`);
  }
}
