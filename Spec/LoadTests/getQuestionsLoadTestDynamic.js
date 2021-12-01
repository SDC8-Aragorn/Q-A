import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(100)<2000'],
  },
  stages: [
//    { duration: '1s', target: 1 },
//    { duration: '30s', target: 1 },
//    { duration: '5s', target: 10 },
//    { duration: '30s', target: 10 },
    { duration: '10s', target: 100 },
    { duration: '30s', target: 100 },
    { duration: '20s', target: 1000 },
    { duration: '30s', target: 1000 },
    { duration: '30s', target: 5625 },
    { duration: '30s', target: 5625 },
//    { duration: '30s', target: 20000 },
//    { duration: '30s', target: 20000 },
    { duration: '30s', target: 0 }
  ]
}

export default function () {
  let rand = randomIntBetween(0, 1000000);
  const res = http.get(`http://localhost:8080/qa/questions?product_id=${rand}`);
  check(res, {'status was 200': (r) => r.status == 200});
  sleep(1);
}