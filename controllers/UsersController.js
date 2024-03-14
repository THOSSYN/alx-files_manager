const { ObjectId } = require('mongodb');
const sha1 = require('sha1');
const Bull = require('bull');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const userQueue = new Bull('userQueue');

    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Establish connection
      await dbClient.client.connect();

      // Access database
      // const db = dbClient.client.db(dbClient.DB_DATABASE);
      const foundEmail = await dbClient.db.collection('users').findOne({ email });

      if (foundEmail) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hashing password using sha1 library
      const hashPwdFmt = sha1(password);

      // Creating user
      const result = await dbClient.db.collection('users').insertOne({
        email,
        password: hashPwdFmt,
      });
      userQueue.add({ userId: result.insertedId });

      // res.status(200).json({ message: 'User created successfully' });
      return res.status(201).json({ id: result.insertedId, email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getMe(req, res) {
    try {
      const sessToken = req.headers['x-token'];

      const retrievalKey = `auth_${sessToken}`;

      // Retrieve userId from Redis
      const userId = await redisClient.get(retrievalKey);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      console.log(userId);

      // Connect to MongoDB and retrieve user based on userId

      const foundUsers = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      console.log(foundUsers);
      if (!foundUsers) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return user object with id and email
      return res.status(200).json({ id: foundUsers._id, email: foundUsers.email });
    } catch (error) {
      console.log('Error retrieving user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UsersController;
