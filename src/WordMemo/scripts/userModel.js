var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var config = require('./config');

let url = config["connect"];
let collection = 'users';
let dbname = 'wordmemo';

class UserModel {
    static updateBook(updateInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': updateInfo[0]};
            const updateStr = {$set: {'learnBook': updateInfo[1]}};
            col.updateOne(whereStr, updateStr, function(err, result) {
                console.log('update user info');
            });
            db.close();
        });
    }

    static updateSetting(updateInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': updateInfo[0]};
            const updateStr = {$set: {'wordNumPerDay': updateInfo[1], 'showEnglish': updateInfo[2]}};
            col.updateOne(whereStr, updateStr, function(err, result) {
                console.log('update user info');
            });
            db.close();
        });
    }

    static addWordBank(addInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': addInfo[0]};
            col.findOne(whereStr, function(err, result) {
                var r = result['wordBank'];
                r.push(addInfo[1]);
                const updateStr = {$set: {'wordBank': r}};
                col.updateOne(whereStr, updateStr, function(err, result) {
                    console.log('update user info');
                });
                db.close();
            });
        });
    }

    static insertWordToLearn(wordInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': wordInfo[0]};
            const updateStr = {$set: {'wordToLearn': wordInfo[1]}};
            col.updateOne(whereStr, updateStr, function(err, result) {
                console.log('update user info');
            });
            db.close();
        });
    }

    static getUser(wordInfo, callbacks) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': wordInfo[0]};
            col.findOne(whereStr, callbacks);
            db.close();
        });
    }

    static insertTodayWord(wordInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': wordInfo[0]};
            const updateStr = {$set: {'todayWords': wordInfo[1]}};
            col.updateOne(whereStr, updateStr, function(err, result) {
                console.log('update user info');
            });
            db.close();
        });
    }

    static insertWordLearning(wordInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': wordInfo[0]};
            const updateStr = {$set: {'wordLearning': wordInfo[1]}};
            col.updateOne(whereStr, updateStr, function(err, result) {
                console.log('update user info');
            });
            db.close();
        });
    }
    static updateScore(updateInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': updateInfo[0]};
            const updateStr = {$set: {'todayWords': updateInfo[1]}};
            col.updateOne(whereStr, updateStr, function(err, result) {
                console.log('update user info');
            });
            db.close();
        });
    }
    static updateTodayMaster(updateInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': updateInfo[0]};
            const updateStr = {$set: {'todayMastered': updateInfo[1]}};
            col.updateOne(whereStr, updateStr, function(err, result) {
                console.log('update user info');
            });
            db.close();
        });
    }

    static updateMastered(updateInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': updateInfo[0]};
            const updateStr = {$set: {'mastered': updateInfo[1]}};
            col.updateOne(whereStr, updateStr, function(err, result) {
                console.log('update user info');
            });
            db.close();
        });
    }

    static updatetodayLearned(updateInfo) {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            const mydb = db.db(dbname);
            const col = mydb.collection(collection);
            const whereStr = {'email': updateInfo[0]};
            const updateStr = {$set: {'todayLearned': updateInfo[1]}};
            col.updateOne(whereStr, updateStr, function(err, result) {
                console.log('update user info');
            });
            db.close();
        });
    }
}

module.exports = UserModel;