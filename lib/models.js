
const mysql = require('mysql');
const stocksData = require('./../etc/symbols.json');

const db = mysql.createPool({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    charset  : 'utf8mb4',
    typeCast: (field, next) => {
        return (field.type == 'JSON')
            ? JSON.parse(field.string())
            : next();
      }
});

module.exports = {
    Stocks: {
        get() {
            return stocksData;
        },

        symbols() {
            return Object.keys(stocksData);
        }
    },

    Portfolio: {
        get(where) {
            return new Promise((resolve, reject) => {
                return db.query(
                    'SELECT * FROM `portfolios` WHERE ?',
                    where, (err, result, fields) => {
                        return (err)
                            ? reject(err)
                            : resolve(result);
                    });
            })
        },

        create(data) {
            return new Promise((resolve, reject) => {
                return db.query(
                    'INSERT INTO `portfolios` SET ?',
                    data, (err, result, fields) => {
                        return (err)
                            ? reject(err)
                            : resolve(result);
                    });
            });
        },

        update(url, data) {
            return new Promise((resolve, reject) => {
                return db.query(
                    'UPDATE `portfolios` SET ? WHERE `url` = ?',
                    [data, url], (err, result, fields) => {
                        return (err)
                            ? reject(err)
                            : resolve(url);
                });
            });
        }
    }
};