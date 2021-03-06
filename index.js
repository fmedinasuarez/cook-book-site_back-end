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

app.use(bodyParser.json({limit: '1000mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '1000mb', extended: true}));

app.get('/', (req, res) => {
    res.send("Hello word!");
})

function errorHandler(err) {
    var error = '';
    if (err.name == 'ValidationError') {
        for (field in err.errors) {
            error += err.errors[field].message + ' ';
        }
    } else {
        error =+"Something unexpected happend."
    }
    return error;
}

app.post('/api/signUp/', (req, res) => {
    console.log(req.body);

    var user = new User();
    user.name = req.body.name;
    user.sureName = req.body.sureName;
    user.email = req.body.email;
    user.myRecipes = req.body.myRecipes;
    user.savedRecipes = req.body.savedRecipes;
    user.setPassword(req.body.password);

    user.save((err, result) => {
        if(err) {
            var errorMessage = errorHandler(err);
            if (errorMessage.toString()=="NaN") {
                errorMessage = "User email already exists."
            }
            res.send({data: [], success : errorMessage, status : 500});
        }
        else {
            res.send({data: [], success : "Successfully added new user", status : 200});
        }
    })
})

app.post('/api/login/', (req, res) => {
    console.log(req.body);
    var emailReq = req.body.email;
    var passwordReq = req.body.password;

    User.findOne({email: emailReq}, (err,user) => {
        if(err){
            res.send({data: [], success: errorHandler(err), status : 500});
        }
        else if(!user){
            res.send({data: [], success:"User not found", status : 500});
        }
        else if(!user.validPassword(passwordReq)) {
            res.send({data: [], success:"Password is wrong", status : 500});
        }
        else {
            res.send({data: [], success:"Login successfully", status : 200});
        }
    })
});

app.post('/api/addRecipe', (req, res) => {
    /*console.log(req.body);*/
    var recipe = new Recipe();
    recipe.title = req.body.title;
    recipe.ingredients = req.body.ingredients;
    recipe.steps = req.body.steps;
    recipe.user = req.body.user;
    recipe.imagesData = req.body.imagesData;

    recipe.save((err,result) => {
        if(err){
            res.send({data: [], success: errorHandler(err), status : 500});
        }
        else {
            User.findOneAndUpdate({email: recipe.user}, {$push: {myRecipes: recipe} }, (err,user) => {
                if(err){
                    res.send({data: [], success: errorHandler(err), status : 500});
                }
                else{
                    res.send({data: [], success:"Successfully added new recipe", status : 200});
                }
            })
        }
    })
});

app.get('/api/myRecipes/:user',(req,res) => {
    const userEmail = req.params['user'];
    User.findOne({email: userEmail}, (err,user) => {
        if(err) {
            res.send({data: [], success: errorHandler(err), status : 500});
        }
        else {
            Recipe.find({'_id':{$in: user.myRecipes}}, (err2,recipes) => {
                if(err2) {
                    res.send({data: [], success: errorHandler(err2), status : 500});
                }
                else {
                    console.log("My recipes were sent correctly");
                    res.send({data: recipes, success: 'my recipes were sent correctly', status : 200});
                }
            })
        }
    })
})

app.get('/api/recipesByTitle/:title',(req,res) => {
    const title = req.params['title'];
    console.log("title recibido: ",title);
    Recipe.find({'title' :{'$regex' : '.*'+title+'.*', '$options' : 'i'}},(err, recipes) => {
        if (err) {
            console.log("Error in find docs with regex");
            res.send({data: [], succes: errorHandler(err), status : 500});
        }
        else {
            console.log("Recipes were sent correctly");
            res.send({data : recipes, success: 'recipes by title were sent correctly', status : 200});
        }
    })
})

app.put('/api/saveRecipe', (req, res) => {
    /*console.log(req.body);*/
    const recipe = req.body.recipe;
    const user = req.body.user;

    User.findOneAndUpdate({email: user}, {$addToSet: {savedRecipes: recipe} }, (err,user) => {
        if(err){
            res.send({data: [], success: errorHandler(err), status : 500});
        }
        else{
            res.send({data: [], success:"Recipe was successfully saved", status : 200});
        }
    })
})

app.get('/api/savedRecipes/:user',(req,res) => {
    const userEmail = req.params['user'];
    User.findOne({email: userEmail}, (err,user) => {
        if(err) {
            console.log('User error in get saved recipes')
            res.send({success: errorHandler(err), status : 500});
        }
        else {
            Recipe.find({'_id':{$in: user.savedRecipes}}, (err2,recipes) => {
                if(err2) {
                    console.log('Error in get saved recipes finding the recipes');
                    res.send({data: [], success: errorHandler(err2), status : 500});
                }
                else {
                    console.log('Saved recipes sent');
                    res.send({data: recipes, success: 'Saved recipes were sent correctly', status : 200});
                }
            })
        }
    })
})

app.post('/api/deleteSavedRecipe',(req,res) => {
    const recipe = req.body.recipe;
    const user = req.body.user;
    User.findOneAndUpdate({email: user}, {$pull: {savedRecipes: recipe._id}}, {'new':true}, (err,user) => {
        if(err){
            console.log("Error in delete saved recipe");
            res.send({data: [], success: errorHandler(err), status : 500});
        }
        else{
            console.log("Delete saved-recipe successfully");
            res.send({data: [], success:"Recipe removed from saved recipes successfully", status : 200});
        }
    })

})

app.get('/api/recipeById/:id',(req,res) => {
    const id = req.params['id'];
    Recipe.findOne({_id: id}, (err, recipe) => {
        if(err) {
            console.log('Recipe error in get recipe by id')
            res.send({data: [], success: errorHandler(err), status : 500});
        }
        else {
            console.log('Recipe by id sent');
            res.send({data: recipe, success: 'Recipe by idsent correctly', status : 200});
        }
    })
})

app.post('/api/deleteMyRecipe',(req,res) => {
    const recipe = req.body.recipe;
    const user = req.body.user;
    User.findOneAndUpdate({email: user}, {$pull: {myRecipes: recipe._id}}, {'new':true}, (err,user) => {
        if(err){
            console.log("Error in delete saved recipe");
            res.send({data: [], success: errorHandler(err), status : 500});
        }
        else{
            console.log("Delete my-recipe successfully");
            res.send({data: [], success:"Recipe removed from saved recipes successfully", status : 200});
        }
    })

})

app.put('/api/editRecipe', (req, res) => {
    const recipe = req.body._id;
    console.log(recipe._id);
    Recipe.findOneAndUpdate({_id: recipe._id}, {$set: 
        {title: recipe.title, ingredients: recipe.ingredients, steps: recipe.steps}}, 
        { 'new': true, 'upsert': false}, (err,r) => {
            if(err){
                console.log("Error in edit  recipe");
                res.send({data: [], success: errorHandler(err), status : 500});
            }
            else{
                console.log("Edit recipe successfully");
                res.send({data: r, success: 'Edit recipe was sent correctly', status : 200});
            }
    })
})

var readline = require('readline');

app.post('/api/chat',(req,res) => {
    const message = req.body.message;
    const user = req.body.user;

    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("User: "+user+". Message: "+message+".\n ", 
        function(answer) {
            res.send({message: "Operator: "+answer, status: 200});
            rl.close();
        }
    );
})


app.listen(app.get('port'),'0.0.0.0', function(err,res) {
    console.log("Server is running on port " + app.get('port'));
});