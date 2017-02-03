var express = require("express");
var app = express();
var passport = require("passport");
var users = require("../data/users.json");
var _ = require("lodash");

var flash = require("connect-flash");
app.use(flash());

var router = express.Router();

router.get("/login", function (req, res) {
	if (req.app.get("env") === "development") {
		var user = users[0];
		if (req.query.user) {
			user = _.find(users, u => u.name === req.query.user);
		}
		req.logIn(user, function (err) {
			if (err) {
				return next(err);
			}
			return res.redirect('/');
		});
		return;
	}
	res.render("login", {
		layout: false
	});
});

router.post("/login", passport.authenticate('local', {
		failureFlash: true,
		failWithError: true
	}),
	function (req, res, next) {
		// handle success
		if (req.xhr) {
			return res.json({
				id: req.user.id
			});
		}
		return res.redirect('/');
	},
	function (err, req, res, next) {
		// handle error
		if (err) {
			return res.render('login', {
				layout: false,
				message: err.message
			});
		}
		next();
		return;
	}
);

router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/login');
});

module.exports = router;
