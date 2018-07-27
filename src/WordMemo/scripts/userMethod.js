var User = require('../scripts/userSchema');
var mongoose = require('mongoose');
var nev = require('email-verification')(mongoose);
var config = require('../scripts/config');
var bcrypt = require('bcryptjs');

// sync version of hashing function
myHasher = function(password, tempUserData, insertTempUser, callback) {
    var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    return insertTempUser(hash, tempUserData, callback);
};

mongoose.Promise = require('bluebird');
mongoose.connect(config["connect"]);

let mailOption = config["mailoptions"];
console.log(mailOption["email"] + "\n" + mailOption["password"]);
console.log('http://' + config["host"] + ':' + config["port"] + '/users');
nev.configure({
    verificationURL: 'http://' + config["host"] + ':' + config["port"] + '/users/email-verification/${URL}',
    persistentUserModel: User,
    tempUserCollection: 'wordmemo_tempusers',

    transportOptions: {
        service: mailOption["service"],
        auth: {
            user: mailOption["email"],
            pass: mailOption["password"]
        }
    },
    verifyMailOptions: {
        from: 'Do Not Reply ' + mailOption["email"],
        subject: 'Please confirm account for WordMemo',
        html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
        text: 'Please confirm your account by clicking the following link: ${URL}'
    },

    confirmMailOptions: {
        from: 'Do Not Reply ' + mailOption["email"],
        subject: 'Account register successfully',
        html: '<p>Successful</p>',
        text: 'Your account has been registered successfully'
    },
    hashingFunction: myHasher

}, function (err, options) {
    if( err )
        console.log(err)
});

nev.generateTempUserModel(User, function (unused, model) {
    if( model ){
        console.log("Register TempUserModel Successful")
    }else {
        console.log("Register TempUserModel Failed")
    }
});



exports.nev = nev;
