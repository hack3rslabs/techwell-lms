const http = require('http');
http.get('http://localhost:3000/login', (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', () => {}); // consume data
}).on('error', (e) => {
  console.error(e);
});
