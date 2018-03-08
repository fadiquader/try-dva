const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(path.resolve(__dirname, '..', 'dist')));

app.get('/*', function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'));
})
const PORT = 3002;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
