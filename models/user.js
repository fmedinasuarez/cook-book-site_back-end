var mongoose = require('mongoose');
var crypto = require('crypto');
var Recipe = require('./recipe');

var userSchema = mongoose.Schema({
    name : {
        type:String,
        required:true,
    },
    sureName : {
        type:String,
        required:true,
    },
    email : {
        type:String,
        required:true,
        unique:true,
    },
    myRecipes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Recipe'
    }],
    savedRecipes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Recipe'
    }],
    hash: String,
    salt: String
});

userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

var User = module.exports = mongoose.model('User',userSchema);
