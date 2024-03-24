import { getDataSource } from '../data-source';
import postSeed from './posts';
import userSeed from './user';

/**
 * Initiates the seeding process for the database by first obtaining a database
 * manager instance and then sequentially calling the userSeed and postSeed functions.
 * This function is a high-level orchestrator that ensures the database is populated
 * with initial sets of user and post data. It's typically used to prepare the
 * database for development, testing, or initial production environments by filling
 * it with data that reflects realistic scenarios.
 *
 * The function works by first obtaining a connection to the database and its
 * associated manager through the getDataSource function. With this manager, it
 * proceeds to seed users into the database followed by seeding posts. This
 * sequential operation ensures that posts are not attempted to be seeded before
 * the necessary user records exist in the database.
 */

const seedDatabase = async () => {
  const { manager } = await getDataSource();
  await userSeed(manager);
  await postSeed(manager);
};

seedDatabase();
