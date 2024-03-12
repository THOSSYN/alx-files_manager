const expect = require('chai').expect;
const request = require('supertest');
const app = require('../server');

let authToken;
let parentId;

describe('Test files i/o operations in server', function() {
  before(function(done) {
    request(app)
      .get('/connect')
      .expect(200)
      .set("Authorization", "Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        
        // Convert res.body to an array
        const responseArray = [res.body];
        
        // Find the entry with type 'file' to get the parent ID
        const fileEntry = responseArray.find(entry => entry.type === 'file');
        if (!fileEntry || !fileEntry.parentId) {
          return done(new Error('Parent ID not found in response'));
        }
        parentId = fileEntry.parentId;
        
        authToken = res.body.token;
        done();
      });
  });

  describe('/files', function() {
    it('Test file retrieval based on parent id', function(done) {
      if (!parentId) {
        return done(new Error('Parent ID is not defined'));
      }
      
      // Use the extracted parent ID in the query string
      request(app)
        .get(`/files?parentId=${parentId}`)
        .set('X-Token', authToken)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          console.log(res.body);
          expect(res.body).to.be.an('object');
          done();
        });
    });
  });
});


/*const expect = require('chai').expect;
const request = require('supertest');
const app = require('../server');

let authToken;
let parentId;

describe('Test files i/o operations in server', function() {
  before(function(done) {
    request(app)
      .get('/connect')
      .expect(200)
      .set("Authorization", "Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=")
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        authToken = res.body.token;
        parentId = res.body[0].parentId;
        done();
      });
  });

  describe('/files', function() {
    it('Test file upload to server', function(done) {
      request(app)
        .post('/files')
        .set('X-Token', authToken)
        .send({ "name": "myText.txt", "type": "file", "data": "SGVsbG8gV2Vic3RhY2shCg==" })
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          // console.log(res.body);
          expect(res.body).to.be.an('object');
          done();
        });
    });

    it('Test file retrieval based on id', function(done) {
      request(app)
	.get('/files/:id')
	.set('X-Token', authToken)
	.expect(200)
	.end((err, res) => {
	  if (err) return done(error);
	  console.log(res.body);
	  expect(res.body).to.be.a('list');
	  done();
	});
    });
  });
});*/
