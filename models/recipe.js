var mongoose = require('mongoose');

var recipeShema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    ingredients: {
        type:[{type: String, required: true}], 
        required:true
    },
    steps: {
        type:String,
        required: true,
    },
    user: {
        type:String,
        required:true,
    },
    imagesData: {
        type: [{type:String}]
    }
})

module.exports = mongoose.model('Recipe',recipeShema);