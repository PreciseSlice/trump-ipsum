const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const environment = 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('API routes', () => {
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
          date: '02/28/2018'
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
          topic: 'TOPIC ONE'
        })
        .then(response => {
          response.should.have.status(422);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'Error you are missing date property'
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

  describe('PATCH api/v1/remarks/:id', () => {
    it('should update the expected remark', () => {
      return chai
        .request(server)
        .patch('/api/v1/remarks/1')
        .send({
          topic: 'NEW TOPIC',
          title: 'The Title',
          date: '2/12/2018'
        })
        .then(response => {
          response.should.have.status(201);
          response.body.remark.should.equal(1);
        });
    });

    it('should not update a remark with missing data', () => {
      return chai
        .request(server)
        .post('/api/v1/remarks')
        .send({
          title: 'The Title',
          date: '2/12/2018'
        })
        .then(response => {
          response.should.have.status(422);
          response.body.should.have.property('error');
          response.body.error.should.equal(
            'Error you are missing topic property'
          );
        });
    });
  });

  describe('DELETE api/v1/remarks/:id', () => {
    xit('should delete the remark with the specified id', () => {
      return chai
        .request(server)
        .delete('/api/v1/remarks/1')
        .then(response => {
          // response.should.have.status(202);
          console.log(response.body);
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
          text: 'All of the women on The Apprentice flirted with me — consciously or unconsciously.'
        })
        .then(response => {
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.id.should.equal(31);
        })
        .catch(err => {
          throw err;
        });
    })
  })
});
