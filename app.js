var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var expressSession = require('express-session');
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth')

var app = express();
var port = process.env.PORT || '5000';

//connect to mongodb

var mongoDB = 'mongodb+srv://username:test1234@cluster0-7zldy.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewUrlParser: true });

var db = mongoose.connection;

db.once('open', _ => {
  console.log('database connected: ', mongoDB)
})

db.on('error', console.error.bind(console, 'mongodb connection error: '))

//schemas

var Schema = mongoose.Schema;

var userSchema = new Schema({
  id: String,
  userProfile: Object,
})

var User = mongoose.model('User', userSchema)



//auth0 config

//session config

const session = {
  secret: "LoxodontaElephasMammuthusPalaeoloxodonPrimelephas",
  cookie: {},
  resave: false,
  saveUninitialized: false
};

if (app.get("env") === "production") {
  // Serve secure cookies, requires HTTPS
  session.cookie.secure = true;
}

//passport config

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || 'http://localhost:5000/callback'
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
  }
);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession(session))

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(function(req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
})


app.use('/api/data', indexRouter);
app.use('/api/data/users', usersRouter);
app.use('/', authRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
