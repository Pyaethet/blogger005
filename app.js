var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");
const session  = require("express-session");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiIndexRouter =require("./api/routes/index");
var apiUserRouter = require("./api/routes/user");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
  secret : "@I#)@#PWI$EI#(#(*@)",
  resave: false,
  saveUninitialized: true,
  })
);

mongoose.connect("mongodb+srv://pyae:pyae123456@blogger005.kmkzune.mongodb.net/?retryWrites=true&w=majority");
const db = mongoose.connection;
db.on ("error", console.error.bind("MongodDB connection error at blogger005"));

app.use(function(req,res,next){
  res.locals.user = req.session.user;
  next();
});

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use("/api",apiIndexRouter);
app.use("/api/user",apiUserRouter);

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
