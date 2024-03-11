const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

exports.getStatus = async (req, res) => {
  try {
    const redisAlive = await redisClient.isAlive();
    const dbAlive = await dbClient.isAlive();
    res.status(200).json({ redis: redisAlive, db: dbAlive });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();
    res.status(200).json({ users: nbUsers, files: nbFiles });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
