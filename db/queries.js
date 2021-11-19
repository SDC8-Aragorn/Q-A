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
  const query = {
    text: 'SELECT * FROM questions WHERE product_id = $1',
    values: [pID],
  }
  return (pool.query(query)
    .catch((e) => console.log(e)));
};

const getAnswersForQuestion = async (qID) => {
  if (qID === undefined) {
    return 'No question ID provided';
  }
  const query = {
    text: 'SELECT id, body, date_written, answerer_name, helpful FROM answers WHERE question_id = $1',
    values: [qID],
  }
  let answersObj = {};
  let answers = await pool.query(query);
  let count = 0;
  let finalAnswers = [];
  answers = await answers.rows;
  for (let i = 0; i < answers.length; i++) {
    let answer = answers[i];
    let photos = await getPhotosForAnswer(answer.id)
    .then((photo) => {
      count++;
      answer.photos = photo;
      finalAnswers.push(answer);
      if (count === answers.length) {
        return finalAnswers;
      }
    });
  }
  return finalAnswers;
};

const getPhotosForAnswer = async (aID) => {
  if (aID === undefined) {
    return 'No answer ID provided';
  }
  const query = {
    text: 'SELECT url FROM photos WHERE answer_id = $1',
    values: [aID]
  }
  let photos = await pool.query(query);
  photos = photos.rows;
  return photos;
}

const queryTest = (qID) => {
  const query = {
    text: 'SELECT json_object_agg(id, (body, date_written, answerer_name, helpful)) FROM answers WHERE question_id = $1',
    values: [qID],
  }
  return(pool.query(query)
    .then((data) => {
      console.log(data.rows);
    })
    .catch((e) => console.log(e)));
}

const h = () => {
  console.log('hello world');
};

module.exports = {
  h,
  getQuestionsForProduct,
  getAnswersForQuestion,
  getPhotosForAnswer,
  queryTest,
};