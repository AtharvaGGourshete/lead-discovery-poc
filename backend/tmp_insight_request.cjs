const http = require("http");
const data = JSON.stringify({ company: "Aether Industries Limited" });
const options = {
  hostname: "127.0.0.1",
  port: 5000,
  path: "/insights/company",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data)
  }
};
const req = http.request(options, (res) => {
  let body = "";
  console.log('STATUS', res.statusCode);
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('BODY', body.slice(0, 1000));
    console.log('BODY_LEN', body.length);
  });
});
req.on('error', err => {
  console.error('REQUEST ERROR', err.message);
});
req.write(data);
req.end();
