USE database qa;

CREATE TABLE questions (
  id SERIAL PRIMARY KEY ,
  product_id INT,
  body VARCHAR(2000),
  date_written VARCHAR(200),
  asker_name VARCHAR(50),
  asker_email VARCHAR(200),
  reported BOOLEAN,
  helpful INT
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INT,
  body VARCHAR(2000),
  date_written VARCHAR(200),
  answerer_name VARCHAR(50),
  answerer_email VARCHAR(200),
  reported BOOLEAN,
  helpful INT
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  answer_id INT,
  FOREIGN KEY (answer_id) REFERENCES answers(id),
  url TEXT
);