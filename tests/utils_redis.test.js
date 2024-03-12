const redisClient = require('../utils/redis');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('redisClient', function() {
  /*before(function() {
    redisClient.createClient();
  });

  after(function() {
    redisClient.quit();
  });*/

  describe('#isAlive()', function() {
    it('Should return true', async function() {
      const expected = await redisClient.isAlive();
      expect(expected).to.equal(true);
    });
  });
 
  describe('#get', function() {
    it('Should return null', async function() {
      const expected = await redisClient.get('MyKey');
      expect(expected).to.equal(null);
    });
    it('Inspect argument get method', function() {
      const spyGet = sinon.spy(redisClient, 'get');
      redisClient.get('MyKey');
      expect(spyGet.calledWithExactly('MyKey')).to.be.true;
      spyGet.restore();
    });
  });

  describe('#set', function() {
    it('Should return the value set the key', async function() {
      const expected = await redisClient.set('MyKey', 12, 5);
      expect(expected).to.equal(12);
    });
    it('Inspect the set method argument', function() {
      const spySet = sinon.spy(redisClient, 'set');
      redisClient.set('MyKey', 10, 10);
      expect(spySet.calledWithExactly('MyKey', 10, 10)).to.be.true;
      spySet.restore();
    });
  });
});
