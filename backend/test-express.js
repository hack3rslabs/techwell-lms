const express = require('express');
const app = express();
app.use((req, res, next) => {
    req.query.test = 'mutated';
    res.json(req.query);
});
app.listen(3000, () => {
    fetch('http://localhost:3000/?foo=bar').then(r => r.json()).then(console.log);
});
