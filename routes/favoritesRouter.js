const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoritesRouter = express.Router(); // favoritesRouter is an express router

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req, res, next) => {
        Favorites.find({user : req.user})
            .populate('favDishes.dish')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites); //sends data back in json format
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorite) => {
                console.log("favorite is : ");
                console.log(favorite);
                console.log(typeof(favorite));
                if (favorite != null) {
                    //favorite.user = req.user._id;
                    //console.log(Favorites.schema.paths);
                    console.log("favorite.dishes before PUSH ")
                    console.log(favorite.dishes);
                    for(var i = 0; i < req.body.length; i++){
                        favorite.dishes.push(req.body[i]._id);
                    }
                    console.log("AFTER PUSH OUTPUT FOLLOWS \n");
                    console.log(favorite);
                    favorite.save()
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite); //sends data back in json format                    
                    }, (err) => next(err));
                }
                else {
                    Favorites.create({user : req.user._id})
                    .then((favorite) => {
                        for(var i = 0; i < req.body.length; i++){
                            favorite.dishes.push(req.body[i]._id);
                        }
                        favorite.save()
                        .then((favorite) => { 
                        console.log(favorite);
                             res.statusCode = 200;
                             res.setHeader('Content-Type', 'application/json');
                             res.json(favorite);
                            },(err) => next(err))              
                    }, (err) => next(err))    
                }
    },(err) => next(err))
    .catch((err) => next(err));
    })
    .put(cors.corsWithOptions,(req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported');
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
        Favorites.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = favoritesRouter;