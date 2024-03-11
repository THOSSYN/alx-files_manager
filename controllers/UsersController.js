const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const sha1 = require('sha1');
const Bull = require('bull');

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
      const db = dbClient.client.db(dbClient.DB_DATABASE);
      const foundEmail = await db.collection('users').findOne({ email });

      if (foundEmail) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hashing password using sha1 library
      const hashPwdFmt = sha1(password);

      // Creating user
      const result = await db.collection('users').insertOne({
        email: email,
        password: hashPwdFmt
      });
      userQueue.add({ userId: result.insertedId });

      // res.status(200).json({ message: 'User created successfully' });
      res.status(200).json({ id: result.insertedId, email: email });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

}

module.exports = UsersController;
/*exports.getMe = async (req, res) => {
  try {
    const sessToken = req.headers["x-token"];
    console.log(req.headers["x-token"]);
    const retrievalKey = `auth_${sessToken}`;
    console.log(retrievalKey);
    // Retrieve userId from Redis
    const userId = await redisClient.get(retrievalKey);
    console.log(userId);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Connect to MongoDB and retrieve user based on userId
    await dbClient.client.connect();
    const db = dbClient.client.db(dbClient.DB_DATABASE);
    const foundUser = await db.collection('users').find({ _id: userId });
    console.log("Found user: ", foundUser);

    if (!foundUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Return user object with id and email
    res.status(200).json({ id: foundUser._id, email: foundUser.email });
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};*/
