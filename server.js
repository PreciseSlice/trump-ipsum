const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
const jwt = require('jsonwebtoken');

process.env.SECRET_KEY = 'Putin Rules';

app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));

app.locals.title = 'Trump Ipsum';

const checkAuth = (request, response, next) => {
  const { token } = request.body;
  
  if (!token) {
    return response
      .status(403)
      .send({ error: 'You must be authorized to access this endpoint.'});
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY);

    next();
  } catch (error) {
    return response.status(403).json({ error: 'invalid token' });
  }
};

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

app.post('/api/v1/remarks', checkAuth, (request, response) => {
  const { title, topic, date } = request.body;
  const remark = { title, topic, date };

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

app.patch('/api/v1/remarks/:id', checkAuth, (request, response) => {
  const { title, topic, date } = request.body;
  const body = { title, topic, date };

  for (let requiredParameter of ['title', 'topic', 'date']) {
    if (!body[requiredParameter]) {
      return response.status(422).send({
        error: `Error you are missing ${requiredParameter} property`
      });
    }
  }

  database('remarks')
    .where('id', request.params.id)
    .select()
    .update({
      title: title,
      topic: topic,
      date: date
    })
    .then(remark => {
      response.status(201).json({ remark });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.delete('/api/v1/remarks/:id', checkAuth, (request, response) => {
  database('remarks')
    .where('id', request.params.id)
    .select()
    .del()
    .then(remark => {
      if (remark) {
        response.status(202).json(remark);
      } else {
        return response.status(422).send({
          error: 'No remark ID provided'
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

app.post('/api/v1/paragraphs', checkAuth, (request, response) => {
  const { length, text, remarks_id } = request.body;
  const paragraph = { length, text, remarks_id };

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

app.patch('/api/v1/paragraphs/:id', checkAuth, (request, response) => {
  const { length, text } = request.body;
  const body = { length, text };

  for (let requiredParameter of ['length', 'text']) {
    if (!body[requiredParameter]) {
      return response.status(422).send({
        error: `Error you are missing ${requiredParameter} property`
      });
    }
  }

  database('paragraphs')
    .where('id', request.params.id)
    .select()
    .update({
      length: length,
      text: text
    })
    .then(paragraph => {
      response.status(201).json({ paragraph });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.delete('/api/v1/paragraphs/:id', checkAuth, (request, response) => {
  database('paragraphs')
    .where('id', request.params.id)
    .select()
    .del()
    .then(paragraph => {
      if (paragraph) {
        response.status(202).json(paragraph);
      } else {
        return response.status(404).send({
          error: 'No paragraph ID provided'
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.post('/authenticate', (request, response) => {
  const payload = request.body;
  const emailDomain = payload.email.substring(payload.email.length - 10);

  for (let requiredParameter of ['appName', 'email']) {
    if (!payload[requiredParameter]) {
      return response.status(422).send({ error: 'Invalid appName or email' });
    }
  }

  if (emailDomain === '@turing.io') {
    const token = jwt.sign(payload, process.env.SECRET_KEY);

    return response.status(201).json({ token });
  } else {
    response.status(401).json({ error: 'Admin privileges not authorized' });
  }
});

app.listen(app.get('port'), () => {
  // eslint-disable-next-line
  console.log(`${app.locals.title} server is running on ${app.get('port')}.`);
});

module.exports = app;
