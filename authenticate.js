var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));/*User.authenticate is
supplied by passport-local-mongoose*/ 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {  //makes and sends token when user is logged in???
    return jwt.sign(user, config.secretKey, 
        {expiresIn: 3600 });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
/*specifies how jwt is extracted */
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
        (jwt_payload, done) => {
            console.log("JWT payload: ", jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {//checks for user in payload in db
                if (err) {
                    return done(err, false);//if no user is found
                }
                else if (user) {
                    return done(null, user);//if user is found
                }
                else { 
                    return done(null,false);
                }
            });
        }));

exports.verifyUser = passport.authenticate('jwt',{session: false});//verifies user

exports.verifyAdmin = (req,res,next) => {
    if(req.user.admin) {
        next();
    }
    else {
        err = new Error("You are not admin! \n Access Denied ");
        err.status = 403;
        return next(err);
    }
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
    },(accessToken, refreshToken, profile, done) => {
        User.findOne({facebookId: profile._id}, (err, user) => {
            if(err) {
                return done(err, false);
            }
            if (!err && user !== null ) {
                return done(null, user);    //if user exists return null and user
            }
            else {
                user = new User({ username: profile.displayName});  //create new user
                user.facebookId= profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err)
                        return done (err, false);
                    else 
                        return done(null, user);
                });
            }
        });
    }

));
