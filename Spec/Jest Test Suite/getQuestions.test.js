const axios = require('axios');

test('Returns status code 400 if no product id is provided', async () => {
  const apiURL = 'http://localhost:8080/qa/questions';
  await axios.get(apiURL)
    .then(r => {
      expect(r.response.status).toBe(400);
    })
    .catch(e => {
      expect(e.response.status).toBe(400);
    });
});