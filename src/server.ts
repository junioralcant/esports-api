import express from 'express';

const app = express();

app.get('/ads', (req, res) => {
  console.log('teste 2');
});

app.listen(3333);
