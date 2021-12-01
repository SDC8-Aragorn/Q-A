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
  -- FOREIGN KEY (product_id) REFERENCES (products(id))
);

CREATE INDEX question ON questions (
  id,
  product_id,
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
  FOREIGN KEY (question_id) REFERENCES (questions(id))
);

CREATE INDEX answer ON answers (
  id,
  question_id,
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  answer_id INT,
  FOREIGN KEY (answer_id) REFERENCES answers(id),
  url TEXT
);

CREATE INDEX photo ON photos (
  id,
  answer_id
);