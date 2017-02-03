var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
// var users = require("./data/users.json");
// var _ = require("lodash");
var db = require("./core/db");

passport.use(new LocalStrategy(function (username, password, done) {
	const strategyQuery = "select *, pwdcompare('" + password + "', senha, 0) as comparedPassword from usuario where codigo = '" + username + "'";

	db.querySql(strategyQuery, function (data, err) {
		if (err) {
			console.log(err);
			done(null, false);
			return;
		} else {
			var user = data[0];

			if (!user || user.comparedPassword !== 1) {
				done(null, false);
				return; 
			}

			done(null, user);
		}
	});

	/*var user = _.find(users, u => u.name === username);

	if (!user || user.password !== password) {
		done(null, false);
		return;
	}

	done(null, user);*/
}));

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});