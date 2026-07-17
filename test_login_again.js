fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@techwell.co.in', password: 'Password@123' })
})
.then(res => Promise.all([res.status, res.json()]))
.then(([status, body]) => console.log('Status:', status, 'Body:', body))
.catch(console.error);
