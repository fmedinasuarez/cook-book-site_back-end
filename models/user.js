var mongoose = require('mongoose');

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
});

var User = module.exports = mongoose.model('User',userShema);
