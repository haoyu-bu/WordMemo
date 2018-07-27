var express = require('express');
var router = express.Router();
var Word = require('../scripts/wordModel');
var Tag = require('../scripts/tagModel');
var User = require('../scripts/userModel');
var Book = require('../scripts/bookModel');

/* GET home page. */
router.get('/', function(req, res, next) {
    //console.log(req.session.user)
    res.render('index', { title: 'WordMemo' });
});

router.get('/login', function (req, res, next) {
    res.render('login', {
        title: 'Login'
    });
});

router.get('/register', function (req, res, next) {
    res.render('register', {
        title: 'Register'
    })
});

// TODO: shuffle
router.get('/learn', function (req, res, next) {
    if( req.session.user.learnBook == null) {
        // if not choose a word book, choose one
        res.redirect('/voclist')
    } else {
        User.getUser([req.session.user.email], function (err, result) {
            req.session.user = result;
            // master all of today's words
            if (!(req.session.user.todayWords.length === 0) && req.session.user.todayMastered === req.session.user.todayWords.length) {
                res.render('finish', {
                    title: 'Finish',
                });
                return;
            }
            if (req.session.user.todayWords.length === 0) {
                User.getUser([req.session.user.email], function (err, result) {
                    // allocate today's words
                    var list;
                    if (req.session.user.wordLearning.length >= req.session.user.wordNumPerDay * 7 / 10) {
                        list = result['wordLearning'].slice(0, Math.floor(req.session.user.wordNumPerDay * 7 / 10) );
                        list = list.concat(result['wordToLearn'].slice(0, Math.ceil(req.session.user.wordNumPerDay - req.session.user.wordNumPerDay * 7 / 10)));
                    } else {
                        list = result['wordToLearn'].slice(0, req.session.user.wordNumPerDay);
                    }
                    let date =  new Date();
                    date.setDate(date.getDate());
                    let month = date.getMonth() + 1;
                    let dateStr = date.getFullYear()+'-'+ month +'-'+ date.getDate();
                    Tag.getReviewWords([req.session.user.email, dateStr], function (err, result) {
                        date.setDate(date.getDate() + 1);
                        let month = date.getMonth() + 1;
                        let dateStr = date.getFullYear()+'-'+ month +'-'+ date.getDate();
                        let l = [];
                        for (let i = 0; i < result.length; i++) {
                            l.push(result[i]['word']);
                            Tag.insertTag([result[i]['word'], req.session.user.email, result[i]['times'], dateStr]);
                        }
                        list = list.concat(l);
                        console.log(list);
                        Word.getWord(list, function (err, result) {
                            if( err ){
                                console.log(err);
                                res.status(500).send()
                            }else {
                                for (let i = 0; i < result.length; i++) {
                                    result[i]['score'] = 0;
                                }
                                req.session.user.todayWords = result;
                                User.insertTodayWord([req.session.user.email, req.session.user.todayWords]);
                            }
                        });
                    });
                });
            }
            res.render('learn', {
                title: 'Learn',
                num: req.session.user.todayWords.length
            })
        })
    }
});

router.get('/test', function (req, res, next) {

    User.getUser([req.session.user.email], function (err, result) {
        req.session.user.todayWords = result['todayWords'];
        req.session.user.wordToLearn = result['wordToLearn'];
        console.log(result['todayWords']);
        res.render('test', {
            title: 'Test',
            list: req.session.user.todayWords[req.session.user.todayLearned]
        })
    })
});

router.get('/review', function (req, res, next) {
    // remove a word from wordToLearn, insert it into wordLearning
    const index = req.session.user.wordToLearn.indexOf(req.session.user.todayWords[req.session.user.todayLearned]['word']);
    if (index >= 0) {
        req.session.user.wordToLearn.splice(index, 1);
        User.insertWordToLearn([req.session.user.email, req.session.user.wordToLearn]);
        req.session.user.wordLearning.push(req.session.user.todayWords[req.session.user.todayLearned]['word']);
        User.insertWordLearning([req.session.user.email, req.session.user.wordLearning]);
    }
    // forget, score - 1
    req.session.user.todayWords[req.session.user.todayLearned]['score'] -= 1;
    req.session.user.todayWords[req.session.user.todayLearned]['score'] = req.session.user.todayWords[req.session.user.todayLearned]['score'] < 0
        ? 0 : req.session.user.todayWords[req.session.user.todayLearned]['score'];
    User.updateScore([req.session.user.email, req.session.user.todayWords]);
    res.render('review', {
        title: 'Review',
        list:req.session.user.todayWords[req.session.user.todayLearned]
    })
});

router.get('/remember', function (req, res, next) {
    // remove a word from wordToLearn, insert it into wordLearning
    const index = req.session.user.wordToLearn.indexOf(req.session.user.todayWords[req.session.user.todayLearned]['word']);
    console.log(req.session.user.todayWords[req.session.user.todayLearned]['word']);
    console.log(index);
    if (index >= 0) {
        req.session.user.wordToLearn.splice(index, 1);
        User.insertWordToLearn([req.session.user.email, req.session.user.wordToLearn]);
        req.session.user.wordLearning.push(req.session.user.todayWords[req.session.user.todayLearned]['word']);
        User.insertWordLearning([req.session.user.email, req.session.user.wordLearning]);
    }
    // remember, score + 1
    req.session.user.todayWords[req.session.user.todayLearned]['score'] += 1;
    User.updateScore([req.session.user.email, req.session.user.todayWords]);
    if (req.session.user.todayWords[req.session.user.todayLearned]['score'] >= 2) {
        // update master tag
        let tagInfo = [];
        tagInfo[0] = req.session.user.todayWords[req.session.user.todayLearned]['word'];
        tagInfo[1] = req.session.user.email;
        Tag.getTag([req.session.user.todayWords[req.session.user.todayLearned]['word'], req.session.user.email], function (err, result) {
            let days = 1;
            if (result == null) {
                days = 1;
                tagInfo[2] = 0;
            }
            else {
                switch (result['times']) {
                    case 0: {
                        days = 1;
                        break;
                    }
                    case 1: {
                        days = 2;
                        break;
                    }
                    case 2: {
                        days = 3;
                        break;
                    }
                    case 3: {
                        days = 8;
                        break;
                    }
                }
                tagInfo[2] = result['times'] + 1;
            }
            let date =  new Date();
            date.setDate(date.getDate() + days);
            let month = date.getMonth() + 1;
            tagInfo[3] = date.getFullYear()+'-'+ month +'-'+ date.getDate();
            if (tagInfo[2] >= 5) {
                tagInfo[3] = "";
                req.session.user.mastered += 1;
                User.updateMastered([req.session.user.email, req.session.user.mastered]);
            }
            Tag.insertTag(tagInfo);
        });
        // update todayMastered
        req.session.user.todayMastered += 1;
        User.updateTodayMaster([req.session.user.email ,req.session.user.todayMastered]);
        // update wordLearning
        const index1 = req.session.user.wordLearning.indexOf(req.session.user.todayWords[req.session.user.todayLearned]['word']);
        console.log(index1);
        req.session.user.wordLearning.splice(index1, 1);
        User.insertWordLearning([req.session.user.email, req.session.user.wordLearning]);
    }
    res.render('review', {
        title: 'Review',
        list: req.session.user.todayWords[req.session.user.todayLearned]
    });
});

router.get('/next', function (req, res, next) {
    if (!(req.session.user.todayWords.length === 0) && req.session.user.todayMastered === req.session.user.todayWords.length) {
        res.render('finish', {
            title: 'Finish',
        });
        return;
    }
    req.session.user.todayLearned = req.session.user.todayLearned + 1;
    req.session.user.todayLearned = req.session.user.todayLearned >= req.session.user.todayWords.length ? 0 : req.session.user.todayLearned;
    while (req.session.user.todayWords[req.session.user.todayLearned]['score'] === 2) {
        req.session.user.todayLearned = req.session.user.todayLearned + 1;
        req.session.user.todayLearned = req.session.user.todayLearned >= req.session.user.todayWords.length ? 0 : req.session.user.todayLearned;
    }
    User.updatetodayLearned([req.session.user.email, req.session.user.todayLearned]);
    res.render('test', {
        title: 'Test',
        list: req.session.user.todayWords[req.session.user.todayLearned]
    })
});

router.get('/voclist', function (req, res, next) {
    if (req.session.user.learnBook) {
        res.render('changebook', {
            title: 'Word Book'
        })
    }
    else{
        res.render('vocalist', {
            title: 'Choose Word Book'
        })
    }

});

router.get('/testreview', function (req, res, next) {
    res.render('testreview', {
        title: 'Test and Review',
        list: req.session.user.todayWords
    })
});

router.get('/wordbank', function (req, res, next) {
    res.render('wordbank', {
        title: 'Word Bank'
    })
});

router.get('/schedule', function (req, res, next) {
    Book.getBookInfo( req.session.user.learnBook, function (err, result) {
        res.render('schedule', {
            title: 'Schedule',
            total: result['number']
        })
    });
});

router.get('/setting', function (req, res, next) {
    res.render('setting', {
        title: 'Setting'
    })
});

router.post('/changebook', function (req, res, next) {
    req.session.user.learnBook = req.body.book;
    User.updateBook([req.session.user.email, req.session.user.learnBook]);
    Book.getBookInfo(req.session.user.learnBook, function (err, result) {
        req.session.user.wordToLearn = result['word'];
        User.insertWordToLearn([req.session.user.email, req.session.user.wordToLearn]);
    });
    res.render('changebook', {
        title: 'Word Book'
    })
});

router.post('/explanation_bank', function(req, res, next) {
    Word.getWord([req.session.user.wordBank[req.body.count]], function (err, result) {
        console.log(result);
        res.render('explanation', {
            title: 'Explanation',
            list: result[0]
        })
    });
});

router.post('/explanation_tr', function(req, res, next) {
    res.render('explanation_tr', {
        title: 'Explanation',
        list: req.session.user.todayWords[req.body.count]
    })
});


module.exports = router;
