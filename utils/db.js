/*const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.client = new MongoClient(`mongodb://${host}:${port}`, { useNewUrlParser: true, useUnifiedTopology: true });
    this.dbName = database;
  }

  async isAlive() {
    try {
      await this.client.connect();
      return true;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      return false;
    }
  }

  async nbUsers() {
    try {
      await this.client.connect();
      const db = this.client.db(this.dbName);
      const usersCollection = db.collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error retrieving number of users:', error);
      return -1;
    }
  }

  async nbFiles() {
    try {
      await this.client.connect();
      const db = this.client.db(this.dbName);
      const filesCollection = db.collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error retrieving number of files:', error);
      return -1;
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;*/

const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    this.DB_HOST = process.env.DB_HOST || 'localhost';
    this.DB_PORT = process.env.DB_PORT || 27017;
    this.DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(`mongodb://${this.DB_HOST}:${this.DB_PORT}`, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  async isAlive() {
    try {
      await this.client.connect();
      return true;
    } catch (error) {
      console.log('Error connecting to MongoDB:', error);
      return false;
    }
  }

  async nbUsers() {
    try {
      await this.client.connect();
      const db = this.client.db(this.DB_DATABASE);
      const userCount = await db.collection('users').countDocuments({});
      return userCount;
    } catch (error) {
      console.error('Error retrieving number of users:', error);
      return -1;
    }
  }

  async nbFiles() {
    try {
      await this.client.connect();
      const db = this.client.db(this.DB_DATABASE);
      const docCount = await db.collection('files').countDocuments({});
      return docCount;
    } catch (error) {
      console.error('Error retrieving number of files:', error);
      return -1;
    }
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
