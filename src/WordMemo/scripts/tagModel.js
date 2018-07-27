var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('./config');
var Word = require('../scripts/wordModel');

let url = config["connect"];
let collection = 'tags';
let dbname = 'wordmemo';

class Tag {
    static insertTag(tagInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const findStm = {word: tagInfo[0], email: tagInfo[1]};
            const updateStm = {$set:{times: tagInfo[2], date: tagInfo[3]}};
            col.update(findStm, updateStm, { upsert: true }, function (err, result) {
                console.log('update tag info');
            });
            db.close();
        });
    }

    static getTag(tagInfo, callbacks) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const tag = {word: tagInfo[0], email: tagInfo[1]};
            col.findOne(tag, callbacks);
            db.close();
        });
    }

    static getReviewWords(tagInfo, callbacks) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const tag = {email: tagInfo[0], date: tagInfo[1]};
            col.find(tag).toArray(callbacks);
            db.close();
        });
    }
}

module.exports = Tag;