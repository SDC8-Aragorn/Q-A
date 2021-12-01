-- SELECT
--   questions.id,
--   questions.body,
--   questions.date_written,
--   asker_name,
--   questions.helpful,
--   questions.reported,
--   jsonb_object_agg(answers.id, jsonb_build_object(
--     'id', answers.id,
--     'body', answers.body,
--     'date', answers.date_written,
--     'answerer_name', answers.answerer_name,
--     'REPORTED', answers.reported,
--     'helpfulness', answers.helpful,
--   )) AS answers
-- FROM questions
-- LEFT JOIN answers
--   ON answers.question_id = questions.id
-- LEFT JOIN photos
--   ON photos.answer_id = answers.id
-- WHERE questions.product_id = 5
--   AND questions.reported = FALSE
--   AND answers.reported = FALSE
-- GROUP BY questions.id
-- ORDER BY questions.id ASC;

SELECT answers.id, answers.body, answers.date_written, answers.answerer_name, answers.helpful, answers.reported, coalesce(json_agg(jsonb_build_object(
  'id', photos.id,
  'url', photos.url
)) FILTER (WHERE photos.id IS NOT NULL)) AS photos
FROM answers
LEFT JOIN photos
  ON photos.answer_id = answers.id
WHERE answers.question_id = $1
  AND answers.reported = false
GROUP BY answers.id
ORDER BY answers.id ASC
LIMIT $2
OFFSET $3;


-- SELECT questions.id, coalesce(json_object_agg(answers.id, jsonb_build_object(
--   'id', answers.id,
--   'body', answers.body,
--   'date', answers.date_written,
--   'answerer_name', answers.answerer_name,
--   'helpfulness', answers.helpful
-- )) FILTER (WHERE answers.id IS NOT NULL)) AS answers, coalesce(
--   json_agg(jsonb_build_object(
--   'id', photos.id,
--   'url', photos.url
-- )) FILTER (WHERE photos.id IS NOT NULL)) AS photos
-- FROM questions
-- LEFT JOIN answers
--   ON questions.id = answers.question_id
-- LEFT JOIN photos
--   ON answers.id = photos.answer_id
-- WHERE questions.product_id = 5
--   AND questions.reported = FALSE
--   AND answers.reported = FALSE
-- GROUP BY questions.id, answers.id
-- ORDER BY questions.id, answers.id ASC;

-- SELECT questions.id, coalesce(json_object_agg(answers.id, jsonb_build_object(
--   'id', answers.id,
--   'body', answers.body,
--   'date', answers.date_written,
--   'answerer_name', answers.answerer_name,
--   'helpfulness', answers.helpful,
--   'photos', p.photos_array
-- )) FILTER (WHERE answers.id IS NOT NULL)) AS answers
-- FROM questions
-- LEFT JOIN answers
--   ON questions.id = answers.question_id
-- CROSS JOIN LATERAL (
--   SELECT coalesce(
--   json_agg(jsonb_build_object(
--   'id', p.id,
--   'url', p.url
--   )) FILTER (WHERE p.id IS NOT NULL)) AS photos_array
--   FROM photos p
--   WHERE answer_id = answers.id
-- ) p
-- WHERE questions.product_id = $1
--   AND questions.reported = FALSE
--   AND answers.reported = FALSE
-- GROUP BY questions.id, answers.id
-- ORDER BY questions.id, answers.id ASC
-- LIMIT $2
-- OFFSET $3;