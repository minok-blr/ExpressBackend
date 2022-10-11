var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override')

// vključimo mongoose in ga povežemo z MongoDB
var mongoose = require('mongoose');
var mongoDB = "mongodb://127.0.0.1/vaja3";
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// vključimo routerje
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/userRoutes');
var photosRouter = require('./routes/photoRoutes');
var questionRouter = require('./routes/questionRoutes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Vključimo session in connect-mongo.
 * Connect-mongo skrbi, da se session hrani v bazi.
 * Posledično ostanemo prijavljeni, tudi ko spremenimo kodo (restartamo strežnik)
 */
var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: mongoDB})
}));
//Shranimo sejne spremenljivke v locals
//Tako lahko do njih dostopamo v vseh view-ih (glej layout.hbs)
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(methodOverride('_method'))
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/photos', photosRouter);
app.use('/questions', questionRouter);

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

app.use(express.static('public'));
var bodyParser = require('body-parser');
/*app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))*/

module.exports = app;
