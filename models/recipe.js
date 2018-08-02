var mongoose = require('mongoose');

var recipeShema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    ingredients: {
        type:[
            {
                type: String,
                required: true
            }
        ], 
        required:true
    },
    steps: {
        type:String,
        required: true,
    }
})

module.exports = mongoose.model('Recipe',recipeShema);