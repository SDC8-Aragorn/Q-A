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
  const res = http.get('http://localhost:8080/qa/questions?product_id=1000011');
  check(res, {'status was 200': (r) => r.status == 200});
  sleep(1);
}

// export const options = {
//   // vus: 10,
//   // duration: '30s',
//   discardResponseBodies: true,
//   scenarios: {
//     contacts: {
//       executor: 'constant-arrival-rate',
//       rate: 100, // RPS, since timeUnit is the default 1s
//       duration: '30s',
//       preAllocatedVUs: 100,
//       maxVUs: 10000,
//     },
//   },
// };