
const { check, validationResult } = require('express-validator/check');
const shortid = require('shortid');
const models = require('./models');
const winston = require('./winston');


module.exports = {
    check: {
        actionBody: [ 
            check('symbols').isArray(),
            check('name').optional().isByteLength({ min:0, max: 60 }),
            check('lock').optional().isByteLength({ min:0, max: 32 })
        ]
    },

    error: {
        globalHandler (err, req, res, next) {
            const status = err.status || 500;
            const message = err.message || 'Something is not right!';
            const toLog = `<${status}><${err.message}><${req.originalUrl}><${req.method}><${req.ip}>`;
            
            if (status != 404) winston.error(toLog);
            return (req.xhr)
                ? res.status(status).json({ message: message })
                : res.status(status).send(message)
        }, 

        badAction (req, res, next) {
            const badRequest = { status: 400 };
            const userSymbols = req.body.symbols;
            const symbols = Object.keys(models.Stocks.get());

            try { validationResult(req).throw(); }
            catch (err) { return next(badRequest); }
        
            return (
                userSymbols.length < 1   || 
                userSymbols.length > 100 || 
                ! userSymbols.every(symbol => symbols.includes(symbol)))
                    ? next(badRequest)
                    : next();
        }
    },

    view: {
        index (req, res, next) {
            const stockSymbols = models.Stocks.get();
            const stocks = Object.keys(stockSymbols).slice(3,15);
            return res.render('index.html', { 
                stocks: stocks,
            });
        },

        portfolio (req, res, next) {
            return models.Portfolio.get({ url: req.params.portfolio })
                .then((found) => {
                    return (found[0])
                        ? res.render('portfolio.html', {
                            name: found[0].name,
                            stocks: found[0].members,
                            portfolio: req.params.portfolio })
                        : next({ status: 404 });
                }).catch((err) => next(err));
        },

        create (req, res, next) {
            return res.render('create.html');
        },

        fork (req, res, next) {
            return models.Portfolio.get({ url: req.params.portfolio })
                .then((found) => {
                    return (found[0])
                        ? res.render('create.html', {
                            name: found[0].name,
                            stocks: found[0].members,
                            portfolio: req.params.portfolio,
                            fork: 1 })
                        : next({ status: 404 });
                }).catch((err) => next(err));
        },

        edit (req, res, next) {
            return models.Portfolio.get({ url: req.params.portfolio })
                .then((found) => {
                    return (found[0])
                        ? res.render('create.html', {
                            name: found[0].name,
                            stocks: found[0].members,
                            portfolio: req.params.portfolio })
                        : next({ status: 404 })
                }).catch((err) => next(err));
        },

        stock (req, res, next) {
            return res.render('stock.html', { 
                symbol: req.params.symbol.toUpperCase(),
                large: true,
            });
        },
    },

    json: {
        search(req, res, next) {
            const q = req.params.q.toUpperCase();
            const stocksData = models.Stocks.get();
            const stockSymbols = models.Stocks.symbols();
    
            return res.status(200).json(stockSymbols
                .filter((i) => i.indexOf(q) >= 0 || stocksData[i].indexOf(q) >= 0)
                .map(i => [i, stocksData[i]]));
        },

        symbol(req, res, next) {
            const symbol = req.params.symbol.toUpperCase();
            const stocksData = models.Stocks.get();
            return (stocksData[symbol])
                ? res.json({ [symbol]: stocksData[symbol] })
                : next({ status: 404 });
        },
    },
    
    action: {
        create (req, res, next) {
            const url = shortid.generate();
            const portfolioData = {
                url: url,
                members: JSON.stringify(req.body.symbols),
                ...(req.body.name && { name: req.body.name }),
                ...(req.body.lock && { lock: req.body.lock })
            };
    
            return models.Portfolio.create(portfolioData)
                .then(() => res.status(201).json({ created: url }))
                .catch((err) => next(err));
        },
    
        edit (req, res, next) {
            const portfolioData = {
                members: JSON.stringify(req.body.symbols),
                ...(req.body.name && { name: req.body.name })
            };
    
            return models.Portfolio.get({ url: req.params.portfolio })
                .then((found) => {
                    if (found[0])
                    return (found[0].lock && found[0].lock != req.body.lock)
                        ? next({ status: 401 })
                        : models.Portfolio.update(req.params.portfolio, portfolioData)
                            .then((url) => res.status(201).json({ created: url }))
                            .catch((err) =>  next(err))
                        
                    return next({ status: 404 });
                }).catch((err) => next(err));
        }
    }
};