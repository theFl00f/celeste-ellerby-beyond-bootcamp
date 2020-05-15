//Required External Modules

var express = require('express');
var router = express.Router();
var passport = require('passport');
var util = require('util');
var url = require('url');
var querystring = require('querystring');

require('dotenv').config();


//Routes Definitions


router.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile'
}), function(req, res) {
    res.redirect('/')
})

router.get('/callback', function(req, res, next) {
    passport.authenticate('auth0', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            // return res.redirect('/login')
            console.log('no user')
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err)
            }
            // var returnTo = req.session.returnTo;
            // delete req.session.returnTo;
            res.redirect('/')
        });
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logOut();
    var returnTo = req.protocol + '://' + req.hostname;
    var port = req.connection.localPort;

    if (port !== undefined && port !== 80 && port !== 443) {
        returnTo += ':' + port;
    }

    var logoutURL = new url.URL(
        util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
    );

    var searchString = querystring.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        returnTo: returnTo
    });
    logoutURL.search = searchString;

    // res.redirect(logoutURL)
    res.redirect('/')
})


//Module Exports

module.exports = router;