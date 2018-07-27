var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema({
    email: String,
    password: String,
    username: String,
    learnBook: String,
    learnTimePerWord: Number,
    wordNumPerDay: Number,
    showEnglish: Boolean,
    todayWords: Array,
    todayLearned: Number,
    todayMastered: Number,
    wordBank: Array,
    wordToLearn: Array,
    wordLearning: Array,
    mastered: Number
});

userSchema.methods.validPassword = function (pw) {
    return bcrypt.compareSync(pw, this.password);
};

module.exports = mongoose.model('user', userSchema);