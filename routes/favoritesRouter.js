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
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .populate('user').populate('dishes')
            .then((favorite) => {
                console.log(favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite); //sends data back in json format
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorite) => {
                if (favorite != null) {
                    for(var i = 0; i < req.body.length; i++){
                        if(favorite.dishes.indexOf(req.body[i]._id) === -1) {
                            favorite.dishes.push(req.body[i]._id);
                        }
                        else {
                            console.log("this item already exists");
                        }
                    }
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

favoritesRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('GETT operation not supported');
        })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorite) => {
                if (favorite != null) {
                        if(favorite.dishes.indexOf(req.params.dishId) === -1) {
                            favorite.dishes.push(req.params.dishId);
                        }
                        else {
                            console.log("this item already exists");
                        }
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
                        if(favorite.dishes.indexOf(req.params.dishId) === -1) {
                            favorite.dishes.push(req.params.dishId);
                        }
                        else {
                            console.log("this item already exists");
                        }
                        favorite.save()
                        .then((favorite) => { 
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
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                console.log(favorites);
                index = favorites.dishes.indexOf(req.params.dishId);
                favorites.dishes.splice(index,1);
                favorites.save()
                .then((favorites) => {    
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                },(err) => next(err))
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favoritesRouter;