/*const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static async getStatus(req, res) {
    try {
      const redisStatus = await redisClient.isAlive();
      const dbStatus = await dbClient.isAlive();
      const status = {
        redis: redisStatus,
        db: dbStatus
      };
      res.status(200).json(status);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }

  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();
      const stats = {
        users: usersCount,
        files: filesCount
      };
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  }
}*/

module.exports = AppController;

const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static async getStatus(req, res) {
    try {
      const redisAlive = await redisClient.isAlive();
      const dbAlive = await dbClient.isAlive();
      res.status(200).json({ redis: redisAlive, db: dbAlive });
    } catch (error) {
      console.error('Error getting status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getStats(req, res) {
    try {
      const nbUsers = await dbClient.nbUsers();
      const nbFiles = await dbClient.nbFiles();
      res.status(200).json({ users: nbUsers, files: nbFiles });
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AppController;
