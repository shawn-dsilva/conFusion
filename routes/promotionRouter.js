const express = require('express');
const bodyParser = require('body-parser');

const promotionRouter = express.Router(); // promotionRouter is an express router

promotionRouter.use(bodyParser.json());

promotionRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => { //modified object from.all() will be passes into this func
    res.end('Will send all the promotiones');
})
.post((req,res,next) => {
    res.end('Will add the promotion : ' +  req.body.name +
     ' with details ' + req.body.description);//body is a JSON string with name and desc as objects
})
.put((req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.delete((req, res, next) => { 
    res.end('Deleting all the promotiones');
}); //GET,POST,PUT,DELETE are all chained together to .route('/')

promotionRouter.route('/:promotionId')
.get((req, res, next) => { //modified object from.all() will be passes into this func
    res.end('Will send details of the promotion' + req.params.promotionId + ' to you ');
})
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on ' + req.params.promotionId );
})
.put((req,res,next) => {
    res.write('Updating the promotion: ' + req.params.promotionId + '\n' );
    res.end('Will update the promotion: ' + req.body.name + 'with details: ' + req.body.description);
})
.delete((req, res, next) => { 
    res.end('Deleting promotion: ' + req.params.promotionId);
});

module.exports = promotionRouter;
