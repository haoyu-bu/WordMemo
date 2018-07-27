var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('./config');

let url = config["connect"];
let collection = 'books';
let dbname = 'wordmemo';

class Book {
    static getBookInfo(name, callbacks) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            col.findOne({"name": name}, callbacks);
            db.close();
        });
    }
}

module.exports = Book;