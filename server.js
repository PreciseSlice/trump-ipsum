const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));

app.locals.title = 'Trump Ipsum';

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} server is running on ${app.get('port')}.`);
});

app.post('/api/v1/remarks', (request, response) => {
  const remark = request.body;
  for (let requiredParameter of ['title', 'topic', 'date']) {
    if (!remark[requiredParameter]) {
      return response.status(422).send({
        error: `Error you are missing ${requiredParameter} property`
      });
    }
  }
  database('remarks')
    .insert(remark, 'id')
    .then(remark => {
      response.status(201).json({ id: remark[0] });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/paragraphs', (request, response) => {
  const paragraph = request.body;
  for (let requiredParameter of ['length', 'text', 'remarks_id']) {
    if (!paragraph[requiredParameter]) {
      return response.status(422).send({
        error: `Error you are missing ${requiredParameter} property`
      });
    }
  }
  database('paragraphs')
    .insert(paragraph, 'id')
    .then(paragraph => {
      response.status(201).json({ id: paragraph[0] });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/remarks', (request, response) => {
  database('remarks')
    .select()
    .then(remarks => {
      if (remarks.length) {
        response.status(200).json(remarks);
      } else {
        response.status(404).json({
          error: 'remarks not found'
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/paragraphs', (request, response) => {
  database('paragraphs')
    .select()
    .then(paragraphs => {
      if (paragraphs.length) {
        response.status(200).json(paragraphs);
      } else {
        response.status(404).json({
          error: 'paragraphs not found'
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/remarks/:id', (request, response) => {
  database('remarks')
    .where('id', request.params.id)
    .select()
    .then(remark => {
      if (remark.length) {
        response.status(200).json(remark);
      } else {
        response.status(404).json({
          error: `Could not find remark with id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/paragraphs/:id', (request, response) => {
  database('paragraphs')
    .where('id', request.params.id)
    .select()
    .then(paragraph => {
      if (paragraph.length) {
        response.status(200).json(paragraph);
      } else {
        response.status(404).json({
          error: `Could not find paragraph with the id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

module.exports = app;
