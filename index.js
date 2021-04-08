const express = require('express');
const generate = require('./generator');

const apis = {
  TestLocal: 'http://127.0.0.1:3002/api-json',
};

let currentApis = {};
async function updateSpecs () {
  currentApis = await generate(apis);
}
updateSpecs();
setInterval(updateSpecs, 5 * 60 * 1000, apis);

const app = express();

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('index', { apis: Object.keys(currentApis) });
});

app.use(express.static('public'));

app.listen(3001, () => console.log('running'));
