const express = require('express');
const generate = require('./generator');

const apis = {
  Petstore: 'https://petstore.swagger.io/v2/swagger.json',
  Users_Microservice: 'https://dev.my.nmite.ac.uk/api/users/api-json',
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

app.listen(3000, () => console.log('running'));
