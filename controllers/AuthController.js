const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');

const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AuthController {
  static async getConnect(req, res) {
    try {
      // Extract email and password from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii').split(':');
      const email = credentials[0];
      const password = credentials[1];

      if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Connect to MongoDB
      // await dbClient.client.connect();

      // Find user in the database
      // const db = dbClient.client.db(dbClient.DB_DATABASE);
      const foundUser = await dbClient.db.collection('users').findOne({ email, password: sha1(password) });

      if (!foundUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate authentication token
      const token = uuidv4();

      // Store user ID in Redis with token as key for 24 hours
      await redisClient.set(`auth_${token}`, foundUser._id.toString(), 24 * 60 * 60);

      // Respond with token
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error signing in user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    try {
      // Retrieve session token from request headers
      const sessToken = req.headers['x-token'];
      if (!sessToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Retrieve user ID associated with the token from Redis
      const userId = await redisClient.get(`auth_${sessToken}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token from Redis
      await redisClient.del(`auth_${sessToken}`);

      // Respond with 204 status (successful deletion)
      return res.status(204).end();
    } catch (error) {
      console.error('Error signing out user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;

/* const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');

const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AuthController {
  static getConnect = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extracting email and password from the authorization header
    const credentials = Buffer.from(
    authHeader.split(' ')[1], 'base64').toString('ascii').split(':');
    const email = credentials[0];
    const password = credentials[1];

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Access client from dbClient attribute
      const client = dbClient.client;

      // Ensure DB connection is established
      await client.connect();

      // Create a mongo db
      const db = client.db(dbClient.DB_DATABASE);

      // Access database to find the user
      const foundUser = await db.collection('users').findOne({ email, password: sha1(password) });

      if (!foundUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate token using uuidv4
      const token = uuidv4();

      //const rClient = redisClient.client;

      // Store user ID in Redis with token as key for 24 hours
      await redisClient.set(`auth_${token}`, foundUser._id.toString(), 24 * 60 * 60);

      // Respond with token
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error signing in user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  static getDisconnect = async (req, res) => {
    const sessToken = req.headers['x-token'];
    const retrievalKey = `auth_${sessToken}`;
    try {
      const client = dbClient.client;
      const db = await client.db(dbClient.DB_DATABASE);
      const userId = await redisClient.get(retrievalKey);
      if (!userId) res.status(401).json({error: "Unauthorized"});
      await redisClient.del(retrievalKey);
      res.status(204).end;
    } catch(e) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  }
}

module.exports = AuthController; */
