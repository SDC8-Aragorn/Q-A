import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(100)<2000'],
  },
  stages: [
    { duration: '10s', target: 100 },
    { duration: '30s', target: 100 },
    { duration: '20s', target: 1000 },
    { duration: '30s', target: 1000 },
    { duration: '30s', target: 0 }
  ]
}

export default function () {
  const res = http.put('http://localhost:8080/qa/answers/6901064/helpful');
  check(res, {'status was 204': (r) => r.status == 204});
  sleep(1);
}