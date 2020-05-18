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
var authRouter = require('./routes/auth');
var messagesRouter = require('./routes/messages');


var app = express();
var port = process.env.PORT || '3000';

//connect to mongodb
var mongoDB = 'mongodb://username:test1234@ds035557.mlab.com:35557/heroku_vvfs5pgw'
// var mongoDB = 'mongodb+srv://username:test1234@cluster0-7zldy.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewUrlParser: true });

var db = mongoose.connection;
var messagesCollection = db.collection('messages')

db.once('open', _ => {
  console.log('database connected: ', mongoDB)
  console.log(app.get('env'))
  // messagesCollection.insertOne({ name: 'hello' })
  messagesCollection.find({})
})

db.on('error', console.error.bind(console, 'mongodb connection error: '))





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
      app.get('env') === 'development' ? 'http://localhost:3000/callback' : process.env.AUTH0_CALLBACK_URL
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
  }
);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', 1)

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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(function(req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
})


app.use('/api/data', indexRouter);
app.use('/api/data/users', usersRouter);
app.use('/', authRouter);
app.use('/api/data/messages', messagesRouter)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  //if req.app.get(env) == deployed ? localhost:3000 : env.AUTH0_CALLBACK_URL
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
