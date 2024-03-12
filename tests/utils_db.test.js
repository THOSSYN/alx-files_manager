const dbClient = require('../utils/db');
const expect = require('chai').expect;

describe('dbClient', function() {
  beforeEach(async function() {
    await dbClient.client.connect();
  });

  after(async function() {
    const client = dbClient.client;
    await client.close();
  });

  describe('#isAlive()', function() {
    it('Should return true or false', async function() {
      const returnVal = await dbClient.isAlive();
      expect(returnVal).to.be.a('boolean');
    });
  });

  describe('#nbUsers()', function() {
    it('Should return the number of users in db', async function() {
      const expectedNumUsers = await dbClient.nbUsers();
      expect(expectedNumUsers).to.be.a('number');
    });
  });

  describe('#nbfiles()', function() {
    it('Should return the number of files in db', async function() {
      const expectedNumUsers = await dbClient.nbFiles();
      expect(expectedNumUsers).to.be.a('number');
    });
  });
});
