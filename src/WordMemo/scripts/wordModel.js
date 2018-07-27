var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('./config');
var Tag = require('../scripts/tagModel');

let url = config["connect"];
let collection = 'words';
let collectionTag = 'tag';
let dbname = 'wordmemo';

class Word {
    static getWord(list, callbacks) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            for(var i = 0; i < list.length; i++) {
                list[i] = {"word": list[i]}
            }
            col.find({$or: list}).toArray(callbacks);
            db.close();
        });
    }
}

module.exports = Word;