const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js
const expect = require('chai').expect;

describe('API', function() {
  describe('/status', function(done) {
    it('should return status 200 with { "redis": true, "db": true }', function(done) {
      request(app)
        .get('/status')
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({ "redis": true, "db": true });
          done();
        });
    });
  });

  describe('/stats', function() {
    it('Should return an object', function(done) {
      request(app)
	.get('/stats')
	.expect(200)
	.end((err, res) => {
	  if (err) return done(err);
	  expect(res.body).to.be.an('object');
	  done();
	});
    });
  });

  describe('/users', function() {
    it('Test login behaviour with full credentials', function(done) {
      request(app)
	.post('/users')
	.send({ "email": "bab@dylan.com", "password": "tata1234!" })
	.expect(200)
	.end((err, res) => {
	  if (err) return done(err);
	  expect(res.body).to.be.an('object');
	  done();
	});
    });

    it('Test sign up behaviour with full credentials', function(done) {
      request(app)
	.post('/users')
	.send({ "email": "bob@dylan.com", "password": "toto1234!" })
	.expect(400)
	.end((err, res) => {
	  if (err) return done(err);
	  expect(res.body).to.eql({"error":"Already exist"});
	  done();
	});
    });

    it('Test sign up behaviour without password', function(done) {
      request(app)
	.post('/users')
	.send({ "email": "bob@dylan.com" })
	.expect(400)
	.end((err, res) => {
	  if (err) return done(err);
	  expect(res.body).to.eql({ "error": "Missing password"});
	  done();
	})
    });

    it('Test sign up behaviour without email', function(done) {
      request(app)
	.post('/users')
	.send({ "password": "testpwd" })
	.expect(400)
	.end((err, res) => {
	  if (err) return done(err);
	  expect(res.body).to.eql({ "error": "Missing email" });
	  done();
	});
    });
  });

});
