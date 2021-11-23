const { Pool, Client } = require('pg');
const Password = require('./.config.js');
// Initialization and connection

const pool = new Pool({
  user: 'superbored',
  host: 'localhost',
  database: 'qa',
  password: Password,
});

pool.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to PostgreSQL!');
  }
});
// Database Queries!

const getQuestionsForProduct = (pID, page, count) => {
  if (pID === undefined) {
    return 'No product Id provided';
  }
  if (page === undefined) {
    page = 1;
  }
  if (count === undefined) {
    count = 5;
  }
  const offset = (page - 1) * count;
  const limit = count;
  const query = {
    text: 'SELECT * FROM questions WHERE product_id = $1 LIMIT $2 OFFSET $3',
    values: [pID, limit, offset],
  }
  return (pool.query(query)
    .catch((e) => console.log(e)));
};

const getAnswersForQuestion = async (qID) => {
  if (qID === undefined) {
    return 'No question ID provided';
  }
  const query = {
    text: 'SELECT id, body, date_written, answerer_name, helpful, reported FROM answers WHERE question_id = $1 LIMIT 5',
    values: [qID],
  }
  let answersObj = {};
  let answers = await pool.query(query);
  let count = 0;
  answers = answers.rows;
  for (let i = 0; i < answers.length; i++) {
    let answer = answers[i];
    if (!answer.reported) {
      let photos = await getPhotosForAnswer(answer.id)
      .then((photo) => {
        count++;
        let epoc = parseInt(answer.date_written, 10);
        let d = new Date(epoc);
        let formattedAnswer = {
          id: answer.id,
          body: answer.body,
          date: d,
          answerer_name: answer.answerer_name,
          helpfulness: answer.helpful,
        };
        formattedAnswer.photos = photo;
        answersObj[formattedAnswer.id] = formattedAnswer;
        if (count === answers.length) {
          return answersObj;
        }
      });
    }
  }
  return answersObj;
};

const getAnswersForSpecificQuestion = async (qID, page,count) => {
  if (qID === undefined) {
    return 'No question ID provided';
  }
  const offset = (page - 1) * count;
  const limit = count;
  const query = {
    text: 'SELECT id, body, date_written, answerer_name, helpful, reported FROM answers WHERE question_id = $1 LIMIT $2 OFFSET $3',
    values: [qID, limit, offset],
  }
  let answers = await pool.query(query);
  let j = 0;
  let finalAnswers = [];
  answers = answers.rows;
  for (let i = 0; i < answers.length; i++) {
    let answer = answers[i];
    if (!answer.reported) {
      let photos = await getPhotosForAnswer(answer.id)
      .then((photo) => {
        j++;
        let epoc = parseInt(answer.date_written, 10);
        let d = new Date(epoc);
        let formattedAnswer = {
          answer_id: answer.id,
          body: answer.body,
          date: d,
          answerer_name: answer.answerer_name,
          helpfulness: answer.helpful,
        };
        formattedAnswer.photos = photo;
        finalAnswers.push(formattedAnswer);
        if (j === answers.length) {
          return finalAnswers;
        }
      });
    }
  }
  return finalAnswers;
};

const getPhotosForAnswer = async (aID) => {
  if (aID === undefined) {
    return 'No answer ID provided';
  }
  const query = {
    text: 'SELECT id, url FROM photos WHERE answer_id = $1',
    values: [aID]
  }
  let photos = await pool.query(query);
  photos = photos.rows;
  return photos;
};

const postQuestion = async (pID, body, name, email) => {
  if (pID === undefined) {
    return 'error';
  }
  if (body === undefined) {
    body = `${name} has nothing to say, but would like to feel included`;
  }
  if (name === undefined) {
    name = 'Anonymous';
  }
  if (email === undefined) {
    email = '';
  }
  const reported = false;
  const helpful = 0;
  const date_written = Date.now();
  // find max index
  const query = {
    text: 'INSERT INTO questions(product_id, asker_email, asker_name, body, reported, helpful, date_written) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    values: [pID, email, name, body, reported, helpful, date_written],
  }

  return (pool.query(query)
    .catch((err) => console.log(err)));
};

const postAnswer = async (qID, body, name, email, photos) => {
  if (qID === undefined) {
    return 'error';
  }
  qID = parseInt(qID, 10);
  if (body === undefined) {
    body = `${name} has nothing to say, but would like to feel included`;
  }
  if (name === undefined) {
    name = 'Anonymous';
  }
  if (email === undefined) {
    email = '';
  }
  const reported = false;
  const helpful = 0;
  const date_written = Date.now();
  let query = {
    text: 'INSERT INTO answers(question_id, body, date_written, answerer_name, answerer_email, reported, helpful) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    values: [qID, body, date_written, name, email, reported, helpful],
  };
  return (pool.query(query)
    .then((result) => {
      let answer_id = result.rows[0].id;
      for (let i = 0; i < photos.length; i++) {
        let url = photos[i];
        query = {
          text: 'INSERT INTO photos(answer_id, url) VALUES ($1, $2)',
          values: [answer_id, url]
        }
        pool.query(query)
          .catch(e => console.log(e));
      }
    })
  )
};

const putHelpfulQuestion = async (qID) => {
  if (qID === undefined) {
    return 'no.';
  }
  const query = {
    text: 'UPDATE questions SET helpful = helpful + 1 WHERE id = $1',
    values: [qID],
  }
  return (pool.query(query)
    .catch(e => console.log(e)));
};

const putReportQuestion = (qID) => {
  if (qID === undefined) {
    return 'no.';
  }
  const query = {
    text: 'UPDATE questions SET reported = true WHERE id = $1',
    values: [qID],
  }
  return (pool.query(query)
    .catch(e => console.log(e)));
};

const putHelpfulAnswer = async (aID) => {
  if (aID === undefined) {
    return 'no.';
  }
  const query = {
    text: 'UPDATE answers SET helpful = helpful + 1 WHERE id = $1',
    values: [aID],
  }
  return (pool.query(query)
    .catch(e => console.log(e)));
};

const putReportAnswer = (aID) => {
  if (aID === undefined) {
    return 'no.';
  }
  const query = {
    text: 'UPDATE answers SET reported = true WHERE id = $1',
    values: [aID],
  }
  return (pool.query(query)
    .catch(e => console.log(e)));
};

module.exports = {
  getQuestionsForProduct,
  getAnswersForQuestion,
  getAnswersForSpecificQuestion,
  getPhotosForAnswer,
  postQuestion,
  postAnswer,
  putHelpfulQuestion,
  putReportQuestion,
  putHelpfulAnswer,
  putReportAnswer,
};