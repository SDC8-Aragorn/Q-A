const axios = require('axios');

test('Returns status code 404 if no question id is provided', async () => {
  const apiURL = 'http://localhost:8080/qa/questions//answers';
  await axios.post(apiURL)
    .then(r => {
      expect(r.response.status).toBe(404);
    })
    .catch(e => {
      expect(e.response.status).toBe(404);
    });
});