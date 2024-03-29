import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.client.connect()
      .then(() => {
        this.db = this.client.db(DB_DATABASE);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const userCollections = this.db.collection('users');
    const numDocs = await userCollections.countDocuments();
    return numDocs;
  }

  async nbFiles() {
    const fileCollections = this.db.collection('files');
    const numFiles = await fileCollections.countDocuments();
    return numFiles;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;

/* const { MongoClient } = require('mongodb');

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

module.exports = dbClient; */
