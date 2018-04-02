const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');
const environment = 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

describe('API routes', () => {
  const token = jwt.sign(
    { email: 'vladimir@turing.io', appName: 'myMinion' },
    process.env.SECRET_KEY
  );

  beforeEach(done => {
    database.migrate.rollback().then(() => {
      database.migrate.latest().then(() => {
        return database.seed.run().then(() => {
          done();
        });
      });
    });
  });

  describe('GET api/v1/remarks', () => {
    it('should return all the remarks', () => {
      return chai
        .request(server)
        .get('/api/v1/remarks')
        .then(response => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(1);
          response.body[0].should.have.property('title');
          response.body[0].title.should.equal('The Title');
          response.body[0].should.have.property('topic');
          response.body[0].topic.should.equal('TOPIC ONE');
          response.body[0].should.have.property('date');
          response.body[0].date.should.equal('2/12/2018');
        })
        .catch(err => {
          throw err;
        });
    });
  });

  describe('POST api/v1/remarks', () => {
    it('should create a new remark', () => {
      return chai
        .request(server)
        .post('/api/v1/remarks')
        .send({
          title: 'Another Title',
          topic: 'TOPIC TWO',
          date: '02/28/2018',
          token
        })
        .then(response => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.id.should.equal(2);
        })
        .catch(err => {
          throw err;
        });
    });

    it('should not create a remark with missing data', () => {
      return chai
        .request(server)
        .post('/api/v1/remarks')
        .send({
          title: 'Yeah He Did That',
          topic: 'TOPIC ONE',
          token
        })
        .then(response => {
          response.should.have.status(422);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'Error you are missing date property'
          );
        });
    });

    it('should not create a remark without a token', () => {
      return chai
        .request(server)
        .post('/api/v1/remarks')
        .send({
          title: 'Yeah He Did That',
          topic: 'TOPIC ONE',
          date: '02/28/2018'
        })
        .then(response => {
          response.should.have.status(403);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'You must be authorized to access this endpoint.'
          );
        });
    });
  });

  describe('GET api/v1/remarks/:id', () => {
    it('should get a specific remark', () => {
      return chai
        .request(server)
        .get('/api/v1/remarks/1')
        .then(response => {
          response.should.have.status(200);
          response.body.should.be.a('array');
          response.body[0].id.should.equal(1);
          response.body[0].title.should.equal('The Title');
          response.body[0].topic.should.equal('TOPIC ONE');
          response.body[0].date.should.equal('2/12/2018');
        });
    });

    it('should return 404 if remark with requested id does not exist', () => {
      return chai
        .request(server)
        .get('/api/v1/remarks/2')
        .then(response => {
          response.should.have.status(404);
          response.body.error.should.equal('Could not find remark with id 2');
        });
    });
  });

  describe('GET /api/v1/remarks?topic=', () => {
    it('should get a remark by topic using a custom query', () => {
      return chai
        .request(server)
        .get('/api/v1/remarks?topic=TOPIC%20ONE')
        .then(response => {
          response.should.have.status(200);
          response.body.should.be.a('array');
          response.body[0].id.should.equal(1);
          response.body[0].title.should.equal('The Title');
          response.body[0].topic.should.equal('TOPIC ONE');
          response.body[0].date.should.equal('2/12/2018');
        });
    });

    it('should return 404 if remark with requested topic does not exist', () => {
      return chai
        .request(server)
        .get('/api/v1/remarks/?topic=TOPIC%20FOUR')
        .then(response => {
          response.should.have.status(404);
          response.body.error.should.equal('Could not find requested remark');
        });
    });
  });

  describe('PATCH api/v1/remarks/:id', () => {
    it('should update the expected remark', () => {
      return chai
        .request(server)
        .patch('/api/v1/remarks/1')
        .send({
          topic: 'NEW TOPIC',
          title: 'The Title',
          date: '2/12/2018',
          token
        })
        .then(response => {
          response.should.have.status(201);
          response.body.remark.should.equal(1);
        });
    });

    it('should not update a remark with missing data', () => {
      return chai
        .request(server)
        .patch('/api/v1/remarks/1')
        .send({
          title: 'The Title',
          date: '2/12/2018',
          token
        })
        .then(response => {
          response.should.have.status(422);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'Error you are missing topic property'
          );
        });
    });

    it('should not patch a remark without a token', () => {
      return chai
        .request(server)
        .patch('/api/v1/remarks/1')
        .send({
          title: 'Yeah He Did That',
          topic: 'TOPIC ONE',
          date: '02/28/2018'
        })
        .then(response => {
          response.should.have.status(403);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'You must be authorized to access this endpoint.'
          );
        });
    });
  });

  describe('DELETE api/v1/remarks/:id', () => {
    it('should delete the remark with the specified id', () => {
      return chai
        .request(server)
        .delete('/api/v1/remarks/1')
        .send({ token })
        .then(response => {
          response.should.have.status(202);
          response.body.should.equal(1);
        });
    });

    it('should return 422 if remark id does not exist', () => {
      return chai
        .request(server)
        .delete('/api/v1/remarks/2')
        .send({ token })
        .then(response => {
          response.should.have.status(422);
          response.body.should.have.property('error');
          response.body.error.should.equal('No remark ID provided');
        });
    });

    it('should not delete a remark without a token', () => {
      return chai
        .request(server)
        .delete('/api/v1/remarks/1')
        .send({
          title: 'Yeah He Did That',
          topic: 'TOPIC ONE',
          date: '02/28/2018'
        })
        .then(response => {
          response.should.have.status(403);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'You must be authorized to access this endpoint.'
          );
        });
    });
  });

  describe('GET api/v1/paragraphs/', () => {
    it('should return all the paragraphs', () => {
      return chai
        .request(server)
        .get('/api/v1/paragraphs')
        .then(response => {
          response.should.have.status(200);
          response.body.should.be.a('array');
          response.body.length.should.equal(30);
          response.body[2].remarks_id.should.equal(1);
          response.body[2].length.should.equal('short');
          response.body[2].text.should.equal(
            'We have a great relationship.  They’re helping us a lot in North Korea.  And that’s China.'
          );
        });
    });
  });

  describe('POST api/v1/paragraphs', () => {
    it('should create a new paragraph', () => {
      return chai
        .request(server)
        .post('/api/v1/paragraphs/')
        .send({
          remarks_id: 1,
          length: 'short',
          token,
          text:
            'All of the women on The Apprentice flirted with me — consciously or unconsciously.'
        })
        .then(response => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.id.should.equal(31);
        })
        .catch(err => {
          throw err;
        });
    });

    it('should not create a new paragraph if missing data', () => {
      return chai
        .request(server)
        .post('/api/v1/paragraphs/')
        .send({
          length: 'short',
          text: 'Something offensive',
          token
        })
        .then(response => {
          response.should.have.status(422);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'Error you are missing remarks_id property'
          );
        });
    });

    it('should not create a paragraph without a token', () => {
      return chai
        .request(server)
        .post('/api/v1/paragraphs/')
        .send({
          length: 'short',
          text: 'Something offensive'
        })
        .then(response => {
          response.should.have.status(403);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'You must be authorized to access this endpoint.'
          );
        });
    });
  });

  describe('GET api/v1/paragraphs/:id', () => {
    it('should return a specific paragraph', () => {
      return chai
        .request(server)
        .get('/api/v1/paragraphs/3')
        .then(response => {
          response.should.have.status(200);
          response.body.should.be.a('array');
          response.body[0].id.should.equal(3);
          response.body[0].length.should.equal('short');
          response.body[0].text.should.equal(
            'We have a great relationship.  They’re helping us a lot in North Korea.  And that’s China.'
          );
        });
    });

    it('should return 404 if paragraph with requested id does not exist', () => {
      return chai
        .request(server)
        .get('/api/v1/paragraphs/32')
        .then(response => {
          response.should.have.status(404);
          response.body.error.should.equal(
            'Could not find paragraph with the id 32'
          );
        });
    });
  });

  describe('PATCH api/v1/paragraphs/:id', () => {
    it('should update the expected paragraph', () => {
      return chai
        .request(server)
        .patch('/api/v1/paragraphs/1')
        .send({
          remarks_id: '1',
          length: 'short',
          text: 'Oops I did it again',
          token
        })
        .then(response => {
          response.should.have.status(201);
          response.body.paragraph.should.equal(1);
        });
    });

    it('should not update a paragraph with missing data', () => {
      return chai
        .request(server)
        .patch('/api/v1/paragraphs/1')
        .send({
          length: 'long',
          remarks_id: '1',
          token
        })
        .then(response => {
          response.should.have.status(422);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'Error you are missing text property'
          );
        });
    });

    it('should not update a paragraph without a token', () => {
      return chai
        .request(server)
        .patch('/api/v1/paragraphs/1')
        .send({
          remarks_id: '1',
          length: 'short',
          text: 'Something offensive'
        })
        .then(response => {
          response.should.have.status(403);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'You must be authorized to access this endpoint.'
          );
        });
    });
  });

  describe('DELETE api/v1/paragraphs/:id', () => {
    it('should delete specified paragraph', () => {
      return chai
        .request(server)
        .delete('/api/v1/paragraphs/1')
        .send({ token })
        .then(response => {
          response.should.have.status(202);
          response.body.should.equal(1);
        });
    });

    it('should return 404 if paragraph id does not exist', () => {
      return chai
        .request(server)
        .delete('/api/v1/paragraphs/32')
        .send({ token })
        .then(response => {
          response.should.have.status(404);
          response.body.should.have.property('error');
          response.body.error.should.equal('No paragraph ID provided');
        });
    });

    it('should not delete a paragraph without a token', () => {
      return chai
        .request(server)
        .delete('/api/v1/paragraphs/1')
        .send({
          remarks_id: '1',
          length: 'short',
          text: 'Something offensive'
        })
        .then(response => {
          response.should.have.status(403);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'You must be authorized to access this endpoint.'
          );
        });
    });
  });

  describe('POST /authenticate', () => {
    it('should return a token', () => {
      return chai
        .request(server)
        .post('/authenticate')
        .send({ 
          "appName": "bobApp",
          "email": "bob@turing.io"
        })
        .then(response => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.token.should.a('string');
        })
        .catch(err => {
          throw err;
        });
    });

    it('should not return a token if required query parameters are missing', () => {
      return chai
        .request(server)
        .post('/authenticate')
        .send({ 
          "email": "bob@turing.io"
        })
        .then(response => {
          response.should.have.status(422);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'Invalid appName or email'
          );
        })
        .catch(err => {
          throw err;
        });
    });
    

    it('should not return a token if the users email does not match the required parameters', () => {
      return chai
        .request(server)
        .post('/authenticate')
        .send({ 
          "appName": "bobApp",
          "email": "bob@gm,ail.com"
        })
        .then(response => {
          response.should.have.status(401);
          response.body.should.be.a('object');
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'Admin privileges not authorized'
          );
        })
        .catch(err => {
          throw err;
        });
    });
  })
});
