var express = require('express');
var router = express.Router();
var User = require('../scripts/userSchema');
var nev = require('../scripts/userMethod').nev;
var UserModel = require('../scripts/userModel');
var Tag = require('../scripts/tagModel');
var Word = require('../scripts/wordModel');
// var toastr = require('toastr')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', function (req, res, next) {
    let user = new User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        learnTimePerWord: 3,
        wordNumPerDay: 5,
        showEnglish: true,
        learnBook: null,
        todayWords: [],
        todayLearned: 0,
        todayMastered: 0,
        wordBank: [],
        wordToLearn: [],
        wordLearning: [],
        mastered: 0
    });
    if( !user.email || !user.password || !user.username ){
        res.render('info', {
            title: "Register Failed",
            message: "Input should not be empty."
        });
        return;
    }
    if (user.username.length < 6) {
        res.render('info', {
            title: "Register Failed",
            message: "Username should be longer than 6 characters."
        });
        return;
    }
    if (user.password.length < 6) {
        res.render('info', {
            title: "Register Failed",
            message: "Password should be longer than 6 characters."
        });
        return;
    }
    if (!(req.body.password == req.body.password2)) {
        res.render('info', {
            title: "Register Failed",
            message: "Inconsistent password."
        });
        return;
    }
    let reg = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/gi;
    if (!reg.test(user.email)) {
        res.render('info', {
            title: "Register Failed",
            message: "Invalid email format."
        });
        return;
    }

    nev.createTempUser(user, function (err, existingPersistentUser, newTempUser) {
        // some sort of error
        if (err){
            console.log(err);
            res.render('info', {
                title: "Error",
                message: 'Internal Error' // ! as TempUser
            });
            return;
        }

        // user already exists in persistent collection...
        if (existingPersistentUser){
            res.render("info", {
                title: "Notice",
                message: 'Email Already Exists' // ! as TempUser
            });
            return;
        }
        // handle user's existence... violently.
        console.log("newTempUser" + newTempUser);
        // a new user
        if (newTempUser) {
            var URL = newTempUser[nev.options.URLFieldName];
            nev.sendVerificationEmail(user.email, URL, function(err, info) {
                if (err){
                    console.log(err);
                    res.render("info", {
                        title: "Error",
                        message: "Internal Error"
                    })
                }else {
                    res.render("info", {
                        title: "Notice",
                        message: "Verification Mail Sended"
                    })
                }
            });
            // user already exists in temporary collection...
        } else {
            res.render("info", {
                title: "Register Failed",
                message: 'Email Already Exists' // ! as TempUser
            })
            // flash message of failure...
        }
    })
});

router.post('/register/resend', function (req, res, next) {
    nev.resendVerificationEmail(req.body.email, function (err, userFound) {
        if (err){
            console.log(err);
            res.status(500).json();
            return;
        }
        // handle error...

        if (userFound) {
            res.render("info", {
                title: "Notice",
                message: "Verification mail has been sended",
                success: true
            })
        }else{
            res.render("info", {
                title: "Error",
                message: "Internal Error"
            })
        }
    })
});

// TODO: provide a verification success page
router.get('/email-verification/:url', function (req, res) {
    let url = req.params.url;

    nev.confirmTempUser(url, function (err, user) {
        if( err ){
            console.log(err)
        }else {
            nev.sendConfirmationEmail(user.email, function (err, info) {
                if( err ){
                    res.render("info", {
                        title: "Notice",
                        message: "Sending confirmation email failed"
                    })
                }else {  // email verification successful
                    // res.cookie('user', new Buffer(user.email).toString('base64'))        // automatically login
                    req.session.user = user;
                    res.redirect('/')       // redirect to home page
                }
            })
        }
    })
});

router.post('/login', function (req, res, next) {
    let email = req.body.email;
    User.findOne({ email: email }, function (err, result) {
        if( err ){
            console.log(err)
        }else {
            if( !result ){   // user not exist
                res.render("info", {title: "Notice", message: 'Email Not Exist'})
            }else{
                if( result.validPassword(req.body.password) ){      // success
                    req.session.user = result;
                    console.log("login success: " + result);
                    if (!(req.session.user.learnBook === null) && req.session.user.todayWords.length === 0) {
                        UserModel.getUser([req.session.user.email], function (err, result) {
                            // allocate today's words
                            var list;
                            if (req.session.user.wordLearning.length >= req.session.user.wordNumPerDay * 7 / 10) {
                                list = result['wordLearning'].slice(0, Math.floor(req.session.user.wordNumPerDay * 7 / 10) );
                                list = list.concat(result['wordToLearn'].slice(0, Math.ceil(req.session.user.wordNumPerDay - req.session.user.wordNumPerDay * 7 / 10)));
                                console.log( list);
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
                                console.log("review" + l);
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
                                        UserModel.insertTodayWord([req.session.user.email, req.session.user.todayWords]);
                                    }
                                });
                            });
                        });
                    }
                    res.redirect('/')
                }else{
                    res.render("info", {title: "Notice", message: 'Incorrect Password' })
                }
            }
        }
    })
});

router.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/')
});

router.post('/setting', function (req, res, next) {
    var info = [];
    if (!req.body.numPerDay.match(/^\d+$/) || req.body.numPerDay <= 0 || req.body.numPerDay > 1000) {
        // toastr.options = {"timeOut": "3000","preventDuplicates": true,"preventManyTimes": true,"hideDuration": "1"};
        // toastr.warning( 'Input should be integer.');
        res.redirect('/setting')
        return;
    }
    if (!req.body.showEnglish.match(/[t][r][u][e]|[f][a][l][s][e]/)) {
        res.redirect('/setting')
        return;
    }
    req.session.user.wordNumPerDay  = req.body.numPerDay;
    req.session.user.showEnglish  = req.body.showEnglish;
    info[0] = req.session.user.email;
    info[1] = req.session.user.wordNumPerDay;
    info[2] = req.session.user.showEnglish;
    UserModel.updateSetting(info);
    res.redirect('/setting')
});

router.post('/add', function(req, res, next) {
    const index = req.session.user.wordBank.indexOf(req.body.myword);
    if (index >= 0 ) {

    }
    else {
        req.session.user.wordBank.push(req.body.myword);
        var info = [];
        info[0] = req.session.user.email;
        info[1] = req.body.myword;
        UserModel.addWordBank(info);
    }
    res.redirect('/review')
});

module.exports = router;
