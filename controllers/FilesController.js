const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const fs = require('fs');
const mime = require('mime-types');
const Bull = require('bull');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FilesController {
  static async postUpload(req, res) {
    const fileQueue = new Bull('fileQueue');
    const sessToken = req.headers['x-token'];
    if (!sessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { name, type, data, parentId } = req.body;
      await dbClient.client.connect();
      const client = dbClient.client;
      const db = client.db(dbClient.DB_DATABASE);

      // Retrieve user ID associated with the token from Redis
      const userId = await redisClient.get(`auth_${sessToken}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check for required fields
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing or invalid type' });
      }

      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }

      // Check if parentId exists and is a folder
      if (parentId) {
        const foundPID = await db.collection('files').findOne({ _id: parentId });
        if (!foundPID) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (foundPID.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      let newFile;

      // Handle folder creation
      if (type === 'folder') {
        newFile = await db.collection('files').insertOne({
          name,
          userId,
          type,
          parentId: parentId || 0,
          isPublic: false
        });
        return res.status(201).json(newFile.ops[0]);
      } else {
        // Handle file creation
        const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(FOLDER_PATH)) {
          fs.mkdirSync(FOLDER_PATH, { recursive: true });
        }

        const fileId = uuidv4();
        const filePath = path.join(FOLDER_PATH, fileId);
        const fileData = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, fileData);

        // Add job to the fileQueue for generating thumbnails
        fileQueue.add({
          userId,
          fileId,
          filePath,
          name,
          type
        });

        newFile = await db.collection('files').insertOne({
          _id: fileId,
          name,
          userId,
          type,
          parentId: parentId || 0,
          isPublic: false,
          localPath: filePath
        });
        return res.status(201).json(newFile.ops[0]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /*static async postUpload(req, res) {
    const fileQueue = new Bull('fileQueue');
    const sessToken = req.headers['x-token'];
    if (!sessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const { name, type, data, parentId } = req.body;
      await dbClient.client.connect;
      const client = dbClient.client;
      const db = client.db(dbClient.DB_DATABASE);
      
      // Retrieve user ID associated with the token from Redis
      const userId = await redisClient.get(`auth_${sessToken}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Check for required fields
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing or invalid type' });
      }

      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }
      
      // Check if parentId exists and is a folder
      if (parentId) {
        const foundPID = await db.collection('files').findOne({ _id: parentId });
        if (!foundPID) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (foundPID.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      let newFile;

      // Handle folder creation
      if (type === 'folder') {
        newFile = await db.collection('files').insertOne({
          name,
          userId,
          type,
          parentId: parentId || 0,
          isPublic: false
        });
        return res.status(201).json(newFile.ops[0]);
      } else {
        // Handle file creation
        const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(FOLDER_PATH)) {
          fs.mkdirSync(FOLDER_PATH, { recursive: true });
        }

        const filePath = path.join(FOLDER_PATH, `${uuidv4()}`);
        const fileData = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, fileData);
        // fileQueue.add(fs.writeFileSync(filePath, fileData));

        newFile = await db.collection('files').insertOne({
          name,
          userId,
          type,
          parentId: parentId || 0,
          isPublic: false,
          localPath: filePath
        });
        return res.status(201).json(newFile.ops[0]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }*/

  static async getShow(req, res) {
    const sessToken = req.headers['x-token'];
    const { parentId } = req.query;
    if (!sessToken) res.status(401).json({ error: "Unauthorized"});

    try {
      await dbClient.client.connect;
      const client = dbClient.client;
      const db = client.db(dbClient.DB_DATABASE);

      const userId = await redisClient.get(`auth_${sessToken}`);
      if (!userId) res.status(401).json({ error: "Unauthorized"});
      const foundFile = await db.collection('files').findOne({ userId: userId, parentId: parentId });
      if (!foundFile) res.status(404).json({ error: "Not found" });
      res.status(200).json(foundFile);
    } catch (error) {
      console.error('Error retrieving file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  static async getIndex(req, res) {
    const sessToken = req.headers['x-token'];
    const { parentId = '0', page = '0' } = req.query;

    if (!sessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const userId = await redisClient.get(`auth_${sessToken}`);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log("userId:", userId);
      console.log("parentId:", parentId);
      console.log("page:", page);

      const client = dbClient.client;
      await client.connect();
      const db = client.db(dbClient.DB_DATABASE);

      const pipeline = [
        { $match: { parentId: parentId } },
        { $skip: parseInt(page) * 20 },
        { $limit: 20 }
      ];
      console.log("Pipeline:", pipeline);
      const files = await db.collection('files').aggregate(pipeline).toArray();
      // const files = await db.collection('files').findOne({"name" : "myText.txt"});
      // const files = await db.collection('files').find();
      console.log("Files:", files);
      res.status(200).json(files);
    } catch (error) {
      console.error('Error retrieving files:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  static async putPublish(req, res) {
    const sessToken = req.headers['x-token'];
    console.log(sessToken);
    if (!sessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  
    const id = req.params.id; // Corrected to use params.id instead of query.id
    console.log(`I got ${id} in putPublish`);
  
    try {
      const client = dbClient.client;
      await client.connect();
      const db = client.db(dbClient.DB_DATABASE);
      const userId = await redisClient.get(`auth_${sessToken}`);
    
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    
      const foundFile = await db.collection('files').findOne({ _id: id, userId: userId });

      if (!foundFile) {
        return res.status(404).json({ error: "Not found" });
      }

      await db.collection('files').updateOne({ _id: id }, { $set: { isPublic: true } });
      res.status(200).json(foundFile);
    } catch (error) {
      console.error('Error updating file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  static async putUnpublish(req, res) {
    const sessToken = req.headers['x-token'];
    console.log(sessToken);
    if (!sessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  
    const id = req.params.id; // Corrected to use params.id instead of query.id
    console.log(`I got ${id} in putPublish`);
  
    try {
      const client = dbClient.client;
      await client.connect();
      const db = client.db(dbClient.DB_DATABASE);
      const userId = await redisClient.get(`auth_${sessToken}`);
    
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    
      const foundFile = await db.collection('files').findOne({ _id: id, userId: userId });

      if (!foundFile) {
        return res.status(404).json({ error: "Not found" });
      }

      await db.collection('files').updateOne({ _id: id }, { $set: { isPublic: false } });
      res.status(200).json(foundFile);
    } catch (error) {
      console.error('Error updating file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  static async getFile(req, res) {
    const fileId = req.params.id;
    if (!fileId) {
      res.status(404).json({ error: "Not found" });
    }
    try {
      const client = redisClient.client;
      await client.connect;
      const db = client.db(dbClient.DB_DATABASE);
      const foundFile = await db.collection('files').findOne({ fileId });
      if (!foundFile) {
        res.status(404).json({ error: "Not found" });
      }
      if (foundFile && foundFile.isPublic === false) {
        res.status(404).json({ error: "Not found" });
      }
      if (foundFile.type === 'folder') {
        res.status(400).json({ error: "folder doesn't have content" });
      }
      if (!foundFile.localPath) { 
        res.status(404).json({ error: "Not found" });
      }
      const fileName = foundFile.name;
      const mimeType = mime-types.lookup(fileName);
      fs.readAsyncFile(mimeType, 'utf-8', (err, data) => {
        if (err) {
	  console.error(err)
	}
	res.status(200).json(data);
      });
      // res.status(200).json(mimeType);
    } catch(e) {
      res.status(500).json({});
    }
  } 

  /*static async getFile(req, res) {
    const fileId = req.params.id;
    const querySize = req.query.size;

    try {
      const client = dbClient.client;
      await client.connect();
      const db = client.db(dbClient.DB_DATABASE);

      // Retrieve the file document based on the provided ID
      const foundFile = await db.collection('files').findOne({ _id: fileId });

      // If no file document is linked to the ID, return 404 error
      if (!foundFile) {
        return res.status(404).json({ error: "Not found" });
      }

      // Check if the file is public
      if (!foundFile.isPublic) {
        return res.status(404).json({ error: "Not found" });
      }

      // Ensure that the file is not a folder
      if (foundFile.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      // Check if the file is locally present
      if (!foundFile.localPath || !fs.existsSync(foundFile.localPath)) {
        return res.status(404).json({ error: "Not found" });
      }

      // Get the MIME type based on the name of the file
      const mimeType = mime.lookup(foundFile.name);

      // Read the content of the file
      fs.readFile(foundFile.localPath, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        // Return the content with the correct MIME type
        res.set('Content-Type', mimeType);
        res.send(data);
      });
    } catch (error) {
      console.error('Error retrieving file:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }*/

}

module.exports = FilesController;
