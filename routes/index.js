var express = require('express');
var router = express.Router();

/*router.use(function (req, res, next) {
	if (req.user.adm) {
		next();
		return;
	}
	res.redirect("/login");
});*/

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Início',
    css: ['pages/index.css'],
    script: ['/js/pages/index.js']
  });
});

module.exports = router;