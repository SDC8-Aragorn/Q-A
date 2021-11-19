const express = require("express");
const axios = require("axios");
const db = require("../db/queries.js");

const port = 8080;
const app = express();

app.use(express.json());
app.listen(port, () => console.log("app listening on port 8080!"));

// Put api calls here!
// TODO: allow for page and count ints to actually do something

app.get("/qa/questions", (req, res) => {
  let result;
  console.log("request recieved!");
  db.getQuestionsForProduct(req.query.product_id).then(async (data) => {
    let arrayOfQuestions = data.rows;
    let count = 0;
    for (let i = 0; i < arrayOfQuestions.length; i++) {
      let question = arrayOfQuestions[i];
      let answers = await db.getAnswersForQuestion(question.id)
      .then((data) => {
        count++;
        question.answers = data;
        if (count === arrayOfQuestions.length) {
          result = {
            product_id: req.query.product_id,
            result: arrayOfQuestions,
          };
          res.status(200).send(result);
        }
      });
    }
  });
});
