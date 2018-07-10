
process.env.NODE_ENV ='test';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHTTP);

 // Portfolio ID's which will be created by tests
// and later used for testing fork/edit operations.
let unlockedPortfolio;
let lockedPortfolio; 

describe('Create Portfolio', () => {
    describe('Valid Scenario', () => {
        it('should create a new portfolio without name and password', (done) => {
            chai.request(server)
                .post('/create')
                .type('json')
                .send({ symbols: ['AMD', 'MSFT'] })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.keys(['created']);
                    unlockedPortfolio = res.body.created;   
                    done();
                });
        });

        it('should create a new portfolio with name and password', (done) => {
            chai.request(server)
                .post('/create')
                .type('json')
                .send({ 
                    symbols: ['AMD', 'MSFT'],
                    name: 'Testing Portfolio',
                    lock: 'qwerty'
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.keys(['created']);
                    lockedPortfolio = res.body.created;
                    done();
                });
        });
    });

    describe('Invalid Scenario', () => {
        it('should not create a new portfolio with very long name', (done) => {
            chai.request(server)
                .post('/create')
                .type('json')
                .send({ 
                    symbols: ['AMD', 'MSFT'],
                    name: 'Testing Portfolio aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!',
                    lock: 'qwerty'
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should not create a new portfolio with very long password', (done) => {
            chai.request(server)
                .post('/create')
                .type('json')
                .send({ 
                    symbols: ['AMD', 'MSFT'],
                    name: 'Testing Portfolio',
                    lock: 'qwertyaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should not create a new portfolio in case symbols is not an array', (done) => {
            chai.request(server)
                .post('/create')
                .type('json')
                .send({ symbols: 'aaa' })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should not create a new portfolio in case symbols is empty array', (done) => {
            chai.request(server)
                .post('/create')
                .type('json')
                .send({ symbols: [] })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should not create a new portfolio in case symbols is longer than 100 symbols', (done) => {
            chai.request(server)
                .post('/create')
                .type('json')
                .send({ symbols: new Array(120) })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should not create a new portfolio in case one of the symbols is bad', (done) => {
            chai.request(server)
                .post('/create')
                .type('json')
                .send({ symbols: ['AMD', 'NVDA', 'BADONE'] })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });
});

describe('Edit Portfolio', () => {
    describe('Valid Scenario', () => {
        it('should prepare for editing an existing portfolio', (done) => {
            chai.request(server)
                .get('/edit/' + unlockedPortfolio)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('should edit an existing locked portfolio', (done) => {
            chai.request(server)
                .post('/edit/' + lockedPortfolio)
                .type('json')
                .send({ 
                    symbols: ['AMD', 'NVDA', 'INTC'],
                    lock: 'qwerty'
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.keys(['created']);
                    done();
                });
        });
    });

    describe('Invalid Scenario', () => {
        it('should return 404 error on unexisting edit request', (done) => {
            chai.request(server)
                .get('/edit/ZZR1000NINJA')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('should not edit a locked portfolio if the password is wrong', (done) => {
            chai.request(server)
                .post('/edit/' + lockedPortfolio)
                .type('json')
                .send({ 
                    symbols: ['AMD', 'NVDA', 'INTC'],
                    lock: 'badbad'
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it('should return 404 error on nonexistant portfolio edit', (done) => {
            chai.request(server)
                .post('/edit/ZZR1000NINJA')
                .type('json')
                .send({ 
                    symbols: ['AMD', 'NVDA', 'INTC'],
                    lock: 'badbad'
                })
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });
});

describe('View Portfolio', () => {
    it('should return an existing portfolio', (done) => {
        chai.request(server)
            .get('/' + unlockedPortfolio)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });

    it('should return 404 error on unexisting portfolio', (done) => {
        chai.request(server)
            .get('/BBDFFFZZZRRRNNN')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
});
