var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var flash = require("express-flash")
var logger = require('morgan');
var indexRouter = require('./routes/index');
const connectionDb = require("./connectionDb/connectionDb")
const fileupload = require("express-fileupload")
const dotenv = require("dotenv")
var app = express();
dotenv.config()
let port = process.env.port
connectionDb()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileupload())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(flash())
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(err, "final error in ejs page")
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(port, (req, res) => {
  console.log(`start your server ${port}`);
})

module.exports = app;
