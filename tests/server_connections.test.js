const expect = require('chai').expect;
const request = require('supertest');
const app = require('../server.js');

let authToken;

describe('Test connections and disconnections', function() {
  describe('/connection', function() {
    it('Test users login behaviour', function(done) {
      request(app)
        .get('/connect')
        .expect(200)
        .set("Authorization", "Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
	  authToken = res.body.token;
          done();
        });
    });
  });

  describe('/disconnection', function() {
    it('Test users log out', function(done) {
      request(app)
	.get('/disconnect')
	.set('X-Token', "unknown&token=")
	.expect(401)
	.end((err, res) => {
	  if (err) return done(err);
	  expect(res.body).to.eql({"error":"Unauthorized"});
	  done();
	});
    });
    it('Test users log out', function(done) {
      request(app)
	.get('/disconnect')
	.set('X-Token', authToken)
	.expect(204)
	.end((err, res) => {
	  if (err) return done(err);
	  expect(res.body).to.eql({});
	  done();
	});
    });
  });

  describe('/users/me', function() {
    it('Test retrieval of user based on token', function(done) {
      request(app)
	.get('/users/me')
	.set('X-Token', authToken)
	.expect(200)
	.end((err, res) => {
	  if (err) return done(err);
	  expect(res.body).to.eql({"id":"5f1e7cda04a394508232559d","email":"bob@dylan.com"});
	});
    });
  });
});
