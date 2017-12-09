const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router(); // leaderRouter is an express router

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => { //modified object from.all() will be passes into this func
    res.end('Will send all the leaderes');
})
.post((req,res,next) => {
    res.end('Will add the leader : ' +  req.body.name +
     ' with details ' + req.body.description);//body is a JSON string with name and desc as objects
})
.put((req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.delete((req, res, next) => { 
    res.end('Deleting all the leaderes');
}); //GET,POST,PUT,DELETE are all chained together to .route('/')

leaderRouter.route('/:leaderId')
.get((req, res, next) => { //modified object from.all() will be passes into this func
    res.end('Will send details of the leader' + req.params.leaderId + ' to you ');
})
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on ' + req.params.leaderId );
})
.put((req,res,next) => {
    res.write('Updating the leader: ' + req.params.leaderId + '\n' );
    res.end('Will update the leader: ' + req.body.name + 'with details: ' + req.body.description);
})
.delete((req, res, next) => { 
    res.end('Deleting leader: ' + req.params.leaderId);
});

module.exports = leaderRouter;
