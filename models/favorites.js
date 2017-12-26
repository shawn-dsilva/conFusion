/*
In this task you will be implementing a new Mongoose schema named favoriteSchema, and a model named Favorites in the file named favorite.js in the models folder. This schema should take advantage of the mongoose population support to populate the information about the user and the list of dishes when the user does a GET operation.
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const Dishes = require('../models/dishes');


// var favdishSchema = new Schema({
//     dish:{
//         type: mongoose.Schema.Types.ObjectId,
//     ref: 'Dish'
//     }
// });

var favoriteSchema = new Schema({
    
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes:[{ type: Schema.Types.ObjectId,
                ref: 'Dishes'}]
},{
    usePushEach : true
});


var  Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;