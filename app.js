var express = require('express');
var path = require('path');
var hbs = require('express-handlebars');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require("passport");
require("./passport-init");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
	extname: 'hbs',
	defaultLayout: 'layout',
	helpers: require("handlebars-form-helpers"),
	layoutsDir: path.join(__dirname, '/views/layouts/'),
	partialsDir: path.join(__dirname, '/views/partials/')
}));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('express-session')({
	secret: 'abra-kadabra',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

var authRouter = require("./routes/auth");
app.use(authRouter);

app.use(function (req, res, next) {
	if (req.isAuthenticated()) {
		res.locals.user = req.user;
		res.cookie('SGIUser', req.user);
		next();
		return;
	}
	res.redirect("/login");
});

var index = require('./routes/index');
app.use('/', index);

var products = require('./routes/products');
app.use('/produtos', products);

var clients = require('./routes/clients');
app.use('/clientes', clients);

var users = require('./routes/users');
app.use('/users', users);

var api = require('./routes/api');
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
