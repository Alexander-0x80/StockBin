require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');

const router = require('./lib/routes');

const app = express();
const jsonParser = bodyParser.json();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('tiny'));
    app.use(express.static('static'));
}

nunjucks.configure('./views', {
    autoescape: true,
    express: app
});

app.get('/', router.view.index);
app.get('/create', router.view.create);
app.get('/fork/:portfolio', router.view.fork);
app.get('/edit/:portfolio', router.view.edit);
app.get('/stock/:symbol', router.view.stock);
app.get('/check/:symbol', router.json.symbol);
app.get('/search/:q', router.json.search);
app.post('/create', jsonParser, router.check.actionBody, router.error.actionBadRequest, router.action.create);
app.post('/edit/:portfolio', jsonParser, router.check.actionBody, router.error.actionBadRequest, router.action.edit);
app.get('/:portfolio', router.view.portfolio);

app.use(router.error.globalHandler);

app.listen(process.env.PORT, () => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`Listening...`);
    }
});

module.exports = app;