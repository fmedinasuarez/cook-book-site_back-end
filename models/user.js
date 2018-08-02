var mongoose = require('mongoose');
var Recipe = require('./recipe');

var userShema = mongoose.Schema({
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
    password : {
        type:String,
        required:true,
    },
    myRecipes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Recipe'
    }],
    savedRecipes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Recipe'
    }],
});

var User = module.exports = mongoose.model('User',userShema);
