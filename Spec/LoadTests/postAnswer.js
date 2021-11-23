import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(100)<2000'],
  },
  stages: [
    { duration: '1s', target: 1 },
    { duration: '30s', target: 1 },
    { duration: '5s', target: 10 },
    { duration: '30s', target: 10 },
    { duration: '10s', target: 100 },
    { duration: '30s', target: 100 },
    { duration: '20s', target: 1000 },
    { duration: '30s', target: 1000 },
    { duration: '30s', target: 0 }
  ]
}

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const payload = JSON.stringify({
    body: "Hello, friend!",
    name: "Marcyman",
    email: "Marcus@email.com",
    photos: ["example.url", "example.url"],
  })
  const res = http.post('http://localhost:8080/qa/questions/3518964/answers', payload, params);
  check(res, {'status was 201': (r) => r.status == 201});
  sleep(1);
}