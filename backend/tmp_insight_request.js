const http = require('http');
const data = JSON.stringify({ company: 'Aether Industries Limited' });
const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/insights/company',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};
const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('HEADERS', JSON.stringify(res.headers, null, 2));
    console.log(body);
  });
});
req.on('error', err => {
  console.error('REQUEST ERROR', err.message);
});
req.write(data);
req.end();
