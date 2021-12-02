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
    text: 'SELECT questions.id, questions.body, questions.date_written, questions.asker_name, questions.date_written, questions.helpful, questions.reported, coalesce(json_object_agg(answers.id, jsonb_build_object(\'id\', answers.id, \'body\', answers.body, \'date\', answers.date_written, \'answerer_name\', answers.answerer_name, \'helpfulness\', answers.helpful, \'photos\', p.photos_array)) FILTER (WHERE answers.id IS NOT NULL)) AS answers FROM questions LEFT JOIN answers ON questions.id = answers.question_id CROSS JOIN LATERAL( SELECT coalesce(json_agg(jsonb_build_object(\'id\', p.id, \'url\', p.url)) FILTER (WHERE p.id IS NOT NULL)) AS photos_array FROM photos p WHERE answer_id = answers.id) p WHERE questions.product_id = $1 AND questions.reported = FALSE AND answers.reported = FALSE GROUP BY questions.id, answers.id ORDER BY questions.id, answers.id ASC LIMIT $2 OFFSET $3',
    values: [pID, limit, offset],
  }
  return (pool.query(query)
    .then(async (data) => {
      let arrayOfQuestions = [];
      for (let i = 0; i < data.rows.length; i++) {
        let question = data.rows[i];
        let epoc = parseInt(question.date_written, 10);
        let d = new Date(epoc);
        for (let key in question.answers) {
          if (!question.answers[key].photos) {
            question.answers[key].photos = [];
          }
        }
        let formattedQuestion = {
          question_id: question.id,
          question_body: question.body,
          question_date: d,
          asker_name: question.asker_name,
          question_helpfulness: question.helpful,
          reported: question.reported,
          answers: question.answers
        };
        arrayOfQuestions.push(formattedQuestion);
      }
      return arrayOfQuestions;
    })
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

const getAnswersForSpecificQuestion = async (qID, page, count) => {
  if (qID === undefined) {
    return 'No question ID provided';
  }
  const offset = (page - 1) * count;
  const limit = count;
  const query = {
    text: 'SELECT answers.id, answers.body, answers.date_written, answers.answerer_name, answers.helpful, answers.reported, coalesce(json_agg(jsonb_build_object(\'id\', photos.id, \'url\', photos.url)) FILTER (WHERE photos.id IS NOT NULL)) AS photos FROM answers LEFT JOIN photos ON photos.answer_id = answers.id WHERE question_id = $1 AND answers.reported = FALSE GROUP BY answers.id ORDER BY answers.id ASC LIMIT $2 OFFSET $3',
    values: [qID, limit, offset],
  }
  let answers = await pool.query(query);
  let finalAnswers = [];
  answers = answers.rows;
  for (let i = 0; i < answers.length; i++) {
    let answer = answers[i];
    let epoc = parseInt(answer.date_written, 10);
    let d = new Date(epoc);
    let formattedAnswer = {
      answer_id: answer.id,
      body: answer.body,
      date: d,
      answerer_name: answer.answerer_name,
      helpfulness: answer.helpful,
    };
    if (answer.photos) {
      formattedAnswer.photos = answer.photos;
    } else {
      formattedAnswer.photos = [];
    }
    finalAnswers.push(formattedAnswer);
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


/*
SELECT
  questions.id,
  questions.body,
  questions.date_written,
  asker_name,
  questions.helpful,
  questions.reported,
  coalesce(
    jsonb_object_agg(answers.id, jsonb_build_object(
      'id', answers.id,
      'body', answers.body,
      'date', answers.date,
      'answerer_name', answers.answerer_name,
      'helpfulness', answers.helpful,
      'photos', string_to_array(answers.photos, ' ')
    )) FILTER (WHERE answer.id IS NOT NULL),
    '{}'
  ) AS answers
FROM questions
LEFT JOIN answers
  ON answers.question_id = questions.id
WHERE product_id = $1::INT
  AND questions.reported = FALSE
  AND answers.reported IS DISTINCT FROM TRUE
GROUP BY questions.id
ORDER BY questions.id ASC
LIMIT $2::INT
OFFSET $3::INT


'SELECT
  questions.id,
  questions.body,
  questions.date_written,
  asker_name,
  questions.helpful,
  questions.reported,
  coalesce(
    jsonb_object_agg(answers.id, jsonb_build_object(
      \'id\', answers.id,
      \'body\', answers.body,
      \'date\', answers.date_written,
      \'answerer_name\', answers.answerer_name,
      \'helpfulness\', answers.helpful,
      \'photos\', json_build_array(
        jsonb_build_object(
          \'id\', photos.id,
          \'url\', photos.url
        )
      )
      )) FILTER (WHERE answers.id IS NOT NULL),
      \'{}\'
      ) AS answers
        FROM questions
        LEFT JOIN answers
          ON answers.question_id = questions.id
        LEFT JOIN photos
         ON photos.answer_id = answers.id
        WHERE product_id = $1
          AND questions.reported = FALSE
          AND answers.reported IS DISTINCT FROM TRUE
        GROUP BY questions.id
        ORDER BY questions.id ASC
        LIMIT $2
        OFFSET $3'

*/