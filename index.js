const express = require('express');
const generate = require('./generator');

const apis = JSON.parse(Buffer.from(process.env.APIS, 'base64').toString('utf8'));

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
