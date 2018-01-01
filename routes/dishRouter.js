const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');

const dishRouter = express.Router(); // dishRouter is an express router

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req, res, next) => {
        Dishes.find({})
            .populate('comments.author')
            .then((dishes) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dishes); //sends data back in json format
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
            .then((dish) => {
                console.log('Dish created ', dish);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);
            }, (err) => next(err))
            .catch((err) => next(err));          

    })
    .put(cors.corsWithOptions,(req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported');
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dishes.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req, res, next) => { 
        Dishes.findById(req.params.dishId)
        .populate('comments.author')        
        .then((dish) => {
            console.log('Dish created ', dish);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on ' + req.params.dishId);
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId, {
            $set: req.body
        }, { new: true} )
        .then((dish) => {
            console.log('Dish created ', dish);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findOneAndRemove(req.params.dishId)
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    });


    dishRouter.route('/:dishId/comments')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')        
            .then((dish) => {
                if (dish != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments); //sends data back in json format
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found ');
                    err.status = 404;
                    return next(err);//returns to app.js main error handler
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            if (dish != null) {
                req.body.author = req.user._id;
                dish.comments.push(req.body);
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish); //sends data back in json format  
                    })                  
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found ');
                err.status = 404;
                return next(err);//returns to app.js main error handler
                }
            }, (err) => next(err))
            .catch((err) => next(err));

    })
    .put(cors.corsWithOptions,(req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
            .then((dish) => { 
                if (dish != null) {
                    for (var i = (dish.comments.length -1 ); i >= 0; i--) {
                        dish.comments.id(dish.comments[i]._id).remove();
                    }
                    dish.save()
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish); //sends data back in json format                    
                    }, (err) => next(err));
                }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found ');
                err.status = 404;
                return next(err);//returns to app.js main error handler
                }
            }, (err) => next(err))
            .catch((err) => next(err));
        });

dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors,(req, res, next) => { 
        Dishes.findById(req.params.dishId)
        .populate('comments.author')        
        .then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId != null)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments.id(req.params.commentId)); //sends data back in json format
            }
            else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found ');
                err.status = 404;
                return next(err);//returns to app.js main error handler
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found ');
                err.status = 404;
                return next(err);//returns to app.js main error handler
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId
                + '/comments/' + req.params.commentId);
    })
    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => {
            reqId = req.user._id;
            authorId = dish.comments.id(req.params.commentId).author;
            console.log(reqId);
            console.log(authorId);
            if(reqId.equals(authorId)) {
                if (dish != null && dish.comments.id(req.params.commentId) != null) {
                   
                        if( req.body.rating) {
                            dish.comments.id(req.params.commentId).rating = req.body.rating;
                        }
                        if( req.body.comment) {
                            dish.comments.id(req.params.commentId).comment = req.body.comment;                    
                        }
                        dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                            .populate('comments.author')
                            .then((dish) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dish); //sends data back in json format
                            })
                            
                            // res.statusCode = 200;
                            // res.setHeader('Content-Type', 'application/json');
                            // res.json(dish.comments.id(req.params.commentId));
                        }, (err) => next(err));
                    }
                    
                    else if (dish == null) {
                        err = new Error('Dish ' + req.params.dishId + ' not found ');
                        err.status = 404;
                        return next(err);//returns to app.js main error handler
                    }
                    else {
                        err = new Error('Comment ' + req.params.commentId + ' not found ');
                        err.status = 404;
                        return next(err);//returns to app.js main error handler
                    }
            }
        else {
            err = new Error("You cannot edit another user's comment ");
            err.status =403;
            next(err);
        }
    }, (err) => next(err))
        .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId)
        .then((dish) => { 
            reqId = req.user._id;
            authorId = dish.comments.id(req.params.commentId).author;
            if (reqId.equals(authorId)) {
                if (dish != null && dish.comments.id(req.params.commentId) != null ) {
                    dish.comments.id(dish.comments.id(req.params.commentId)).remove();
                    dish.save()
                    .then((dish) => {
                        Dishes.findById(dish._id)
                        .populate('comments.author')
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish); //sends data back in json forma
                        })                    
                    }, (err) => next(err));
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found ');
                    err.status = 404;
                    return next(err);//returns to app.js main error handler
                    }
        }
        else {
            err = new Error("You cannot delete another user's comment ");
            err.status =403;
            next(err);
        }
    },(err) => next(err))
        .catch((err) => next(err));
    });
    
module.exports = dishRouter;