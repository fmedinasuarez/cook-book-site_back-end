var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var User = require('./models/user');
var Recipe = require('./models/recipe');

var app = express();

var db = mongoose.connect('mongodb://localhost:27017/cookbooksitedb', { useNewUrlParser: true }, function(err,res){
        if (err) console.log("DataBase connection error!");
        console.log("DataBase connection added!")
});

app.use(cors());

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hello word!");
})

function errorHandler(err) {
    var error = '';
    if (err.name == 'ValidationError') {
        for (field in err.errors) {
            error += err.errors[field].message + ' ';
            console.log('Error value: ', error);
        }
    } else {
        error =+"Something unexpected happend."
    }
    return error;
}

app.post('/signup', (req, res) => {
    console.log(req.body);
    var name = req.body.name;
    var sureName = req.body.sureName;
    var email = req.body.email;
    var password = req.body.password;

    var user = new User();
    user.name = name;
    user.sureName = sureName;
    user.email = email;
    user.password = password;
    user.myRecipes = [];
    user.savedRecipes = [];

    user.save((err, result) => {
        if(err) {
            var errorMessage = errorHandler(err);
            if (errorMessage.toString()=="NaN") {
                errorMessage = "User email already exists."
            }
            res.send({success : errorMessage, status : 500});
        }
        else {
            res.send({success : "Successfully added new user!", status : 200});
        }
    })
    
})

app.post('/login', (req, res) => {
    console.log(req.body);
    var emailReq = req.body.email;
    var passwordReq = req.body.password;

    User.findOne({email: emailReq}, (err,user) => {
        if(err){
            res.send({success: errorHandler(err), status : 500});
        }
        else if(!user){
            res.send({success:"User not found", status : 500});
        }
        else if(user.password != passwordReq) {
            res.send({success:"Password is wrong", status : 500});
        }
        else {
            res.send({success:"Login successfully", status : 200});
        }
    })
});

app.post('/addrecipe', (req, res) => {
    console.log(req.body);
    var recipe = new Recipe();
    recipe.title = req.body.title;
    recipe.ingredients = req.body.ingredients;
    recipe.steps = req.body.steps;
    
    recipe.save((err,result) => {
        if(err){
            res.send({success: errorHandler(err), status : 500});
        }
        else {
            res.send({success:"Successfully added new recipe", status : 200});
        }
    })
});

app.listen(app.get('port'), function(err,res) {
    console.log("Server is running on port " + app.get('port'));
});