import { getDataSource } from '../data-source';
import { Post } from '../entities/Post';
import { PostRepository } from '../repository/post';
import { UserRepository } from '../repository/user';
import { Event, User } from '../util';
import LoggerService from '../util/logger';
import { Opts, registerTopics } from './topics';

export const initializeSubscribers = (options: Opts) => {
  const { EventBroker, TopicNames } = options;

  registerTopics({ EventBroker, TopicNames });
  const logger = LoggerService.getInstance();

  EventBroker.subscribe(TopicNames.postCreated, async (event: Event) => {
    const { manager } = await getDataSource();
    const postRepository = new PostRepository(manager);

    const localLog = logger.createChildLogger(event);
    await postRepository.createEntity(event.payload as Post);
    localLog.info('Succesfully created post');
  });

  EventBroker.subscribe(TopicNames.postUpdated, async (event: Event) => {
    const { manager } = await getDataSource();
    const postRepository = new PostRepository(manager);

    const localLog = logger.createChildLogger(event);
    const updateToPost = event.payload as Post;
    const { body, title } = updateToPost;
    await postRepository.save({
      ...updateToPost,
      ...(body && { body }),
      ...(title && { title }),
    });

    localLog.info('Succesfully updated post');
  });

  EventBroker.subscribe(TopicNames.postDeleted, async (event: Event) => {
    const { manager } = await getDataSource();
    const postRepository = new PostRepository(manager);

    const id = event.payload as string;
    const localLog = logger.createChildLogger(event);
    await postRepository.delete(id);
    localLog.info('Succesfully deleted post');
  });

  // Users subscribers
  EventBroker.subscribe(TopicNames.userUpdated, async (event: Event) => {
    const { manager } = await getDataSource();
    const userRepository = new UserRepository(manager);
    const localLog = logger.createChildLogger(event);

    const userToUpdate = event.payload as User;
    const { firstName, lastName, birthdate } = userToUpdate;

    await userRepository.save({
      ...userToUpdate,
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(birthdate && { birthdate }),
    });

    localLog.info('Succesfully updated post');
  });

  EventBroker.subscribe(TopicNames.userDeleted, async (event: Event) => {
    const localLog = logger.createChildLogger(event);
    const { manager } = await getDataSource();
    const userRepository = new UserRepository(manager);
    const postRepository = new PostRepository(manager);

    const userToDelete = event.payload as User;
    await postRepository.delete({
      userId: userToDelete.id,
    });

    await userRepository.delete(userToDelete.id);
    localLog.info(
      `user with id - ${userToDelete.id} has succesfully being deleted`
    );
  });

  logger.info('Succesfully registered all subscribers');
};
