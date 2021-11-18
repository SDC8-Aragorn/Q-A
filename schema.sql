USE database qa;

CREATE TABLE questions (
  id INT PRIMARY KEY,
  product_id INT,
  body VARCHAR(2000),
  date_written DATE,
  asker_name VARCHAR(50),
  asker_email VARCHAR(200),
  reported BOOLEAN,
  helpful INT
);

CREATE TABLE answers (
  id INT PRIMARY KEY,
  question_id INT,
  body VARCHAR(2000),
  date_written DATE,
  answerer_name VARCHAR(50),
  answerer_email VARCHAR(200),
  reported BOOLEAN,
  helpful INT
);

CREATE TABLE photos (
  id INT PRIMARY KEY,
  answer_id INT,
  FOREIGN KEY (answer_id) REFERENCES answers(id),
  url TEXT
);