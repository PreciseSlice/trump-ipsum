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
          response.body.should.have.property('id')
        })
        .catch(err => {
          throw err;
        });
    });
  });
});
