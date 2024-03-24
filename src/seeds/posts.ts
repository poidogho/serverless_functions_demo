import { v4 as uuidv4 } from 'uuid';
import { EntityManager } from 'typeorm';
import LoggerService from '../util/logger';
import { PostRepository } from '../repository/post';
import { testUsersId } from '../util/mockData';

/**
 * Seeds the database with initial post data for testing or development purposes.
 * This function iterates over a predefined list of user IDs, creating multiple posts
 * for each user. It utilizes the PostRepository to create post entities in the database.
 * Each post is assigned a unique identifier, a title, a body, and timestamps for creation
 * and last update. Upon completion, it logs a message indicating the successful seeding
 * of user posts.
 *
 * @param {EntityManager} manager - The entity manager that provides access to the database and repositories.
 */
const postSeed = async (manager: EntityManager) => {
  const logger = LoggerService.getInstance();
  const postRepository = new PostRepository(manager);

  await Promise.all(
    Object.keys(testUsersId).map(async (key) => {
      const userId = testUsersId[key];
      await Promise.all(
        Array.from({ length: 30 }).map(async (_, idx) => {
          const now = new Date();
          await postRepository.createEntity({
            id: uuidv4(),
            userId,
            title: `title ${idx} by ${userId}`,
            body: `body ${idx} by ${userId}`,
            created_at: now,
            updated_at: now,
          });
        })
      );
    })
  );

  logger.info('User Posts have been seeded');
};

export default postSeed;
