const Bull = require('bull');
const dbClient = require('../utils/db');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs').promises;

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const client = dbClient.client;
  await client.connect();
  const db = client.db(dbClient.DB_DATABASE);

  const foundFile = await db.collection('files').findOne({ _id: fileId, userId: userId });
  if (!foundFile) {
    throw new Error('File not found');
  }

  // Generate thumbnails
  const filePath = foundFile.localPath;
  const thumbnailSizes = [500, 250, 100];
  const promises = thumbnailSizes.map(async (size) => {
    const thumbnailPath = `${filePath}_${size}`;
    const thumbnail = await imageThumbnail(filePath, { width: size });
    await fs.writeFile(thumbnailPath, thumbnail);
  });

  await Promise.all(promises);
});

const userQueue = new Bull('userQueue');

userQueue.process((job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const foundUser = await db.collection('users').findOne({ _id: userId });
  if (!foundUser) {
    throw new Error('User not found');
  }
  console.log(`Welcome ${foundUser.email}`);
});
