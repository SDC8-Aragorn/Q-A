const newrelic = require('newrelic');
const express = require('express');
const axios = require('axios');
const db = require('../db/queries.js');


const port = 8080;
const app = express();

app.use(express.json());
app.listen(port, () => console.log('App listening on port 8080!'));

// Put api calls here!
// TODO: allow for page and count ints to actually do something

app.get('/qa/questions', (req, res) => {
  let result;
  if (req.query.product_id === undefined) {
    res.status(400).end();
    return;
  }
  db.getQuestionsForProduct(req.query.product_id, req.query.page, req.query.count).then(async (data) => {
    res.status(200).send(data);
  });
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  const questionID = req.params.question_id
  if (req.query.page === undefined) {
    req.query.page = 1;
  }
  if (req.query.count === undefined) {
    req.query.count = 5;
  }
  db.getAnswersForSpecificQuestion(questionID, req.query.page, req.query.count)
    .then((arrayOfAnswers) => {
      let result = {
        question: questionID,
        page: req.query.page,
        count: req.query.count,
        results: arrayOfAnswers,
      }
      res.status(200).send(result);
    })
});

app.post('/qa/questions', (req, res) => {
  const { body, name, email, product_id } = req.body;
  db.postQuestion(product_id, body, name, email)
    .then((response) => {
      if (response === 'error') {
        res.status(400).end();
      } else {
        res.status(201).end()
      }
    });
});

app.post('/qa/questions/:question_id/answers', (req, res) => {
  // body, name, email, photos are paramters provided to the api in the body
  const questionID = req.params.question_id;
  const { body, name, email, photos } = req.body;
  // send this information to one query endpoint
  db.postAnswer(questionID, body, name, email, photos)
    .then((response) => {
      if (response === 'error') {
        res.status(400).end();
      } else {
        res.status(201).end();
      }
    });
  // once a promise is returned
  // send response to client
});

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  let questionID = req.params.question_id;
  db.putHelpfulQuestion(questionID)
    .then(() => res.status(204).end());
});

app.put('/qa/questions/:question_id/report', (req, res) => {
  let questionID = req.params.question_id;
  questionID = parseInt(questionID);
  db.putReportQuestion(questionID)
    .then(() => res.status(204).end());
});

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  let answerID = req.params.answer_id;
  answerID = parseInt(answerID);
  db.putHelpfulAnswer(answerID)
    .then(() => res.status(204).end());
});

app.put('/qa/answers/:answer_id/report', (req, res) => {
  let answerID = req.params.answer_id;
  answerID = parseInt(answerID);
  db.putReportAnswer(answerID)
    .then(() => res.status(204).end());
});
