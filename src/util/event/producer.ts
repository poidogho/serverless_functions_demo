import { Event } from '../types';
import { Topic } from './topic';

// Default version to use if an event does not specify a version
const DEFAULT_TOPIC_VERSION = 'v0.0.1';

/**
 * Producer class responsible for publishing events to a specified topic.
 * It ensures that each event has a version, either provided or default.
 *
 * @template T - The event type that extends the base Event interface, ensuring type safety for event payloads.
 */
export class Producer<T extends Event> {
  /**
   * Creates an instance of the Producer class.
   *
   * @param {Topic<T>} topic - The topic to which this producer will publish events. The topic must be an instance of the Topic class, ensuring that the events are handled correctly.
   */
  constructor(private topic: Topic<T>) {}

  /**
   * Publishes an event to the associated topic. If the event does not specify a version, it assigns a default version.
   *
   * @param {T} event - The event to be published. It must extend the base Event interface, containing at least 'type' and optionally 'version' and 'payload'.
   */
  public publish(event: T): void {
    const { version } = event;

    // Publish the event to the topic, ensuring it has a version
    this.topic.publish({
      ...event,
      version: version ?? DEFAULT_TOPIC_VERSION, // Use provided version or default
    });
  }
}
