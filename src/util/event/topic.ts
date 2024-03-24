import { ErrorMessages } from '../errors';
import { Event } from '../types';

/**
 * Validates the structure of an event to ensure it conforms to the Event interface.
 *
 * @param {Event} event - The event to validate.
 * @returns {boolean} - Returns true if the event has both 'version' and 'type' fields, where 'version' is a number and 'type' is a string; otherwise, false.
 */
export const isValidEvent = (event: Event): event is Event => {
  return (
    'version' in event &&
    'type' in event &&
    typeof event.version === 'string' &&
    typeof event.type === 'string'
  );
};

/**
 * Topic class for managing subscriptions and publishing events to subscribers.
 *
 * @template T - Specifies the event type this topic can handle, extending the base Event interface.
 */
export class Topic<T extends Event> {
  private subscribers: Array<(event: T) => void> = [];

  /**
   * Subscribes a handler to the topic. The handler will be called with an event whenever the topic publishes an event.
   *
   * @param {(event: T) => void} subscriber - The event handler function that will receive published events.
   */
  public subscribe(subscriber: (event: T) => void): void {
    this.subscribers.push(subscriber);
  }

  /**
   * Publishes an event to all subscribed handlers, after validating the event's structure.
   *
   * @param {T} event - The event to publish. It must conform to the Event interface, having 'type' and 'version' fields.
   * @throws {Error} If the event does not have a valid structure.
   */
  public publish(event: T): void {
    if (!isValidEvent(event)) {
      throw new Error(ErrorMessages.INVALID_EVENT_STRUCTURE);
    }

    this.subscribers.forEach((subscriber) => {
      subscriber(event);
    });
  }
}
