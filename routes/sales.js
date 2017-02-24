var express = require('express');
var db = require("../core/db");

var router = express.Router();

/*router.use(function (req, res, next) {
	if (req.user.adm) {
		next();
		return;
	}
	res.redirect("/login");
});*/

/* GET sales page. */
router.get('/', function (req, res, next) {
    res.render('sales', {
        title: 'DAVs',
        css: ['/vendors/bootstrap-switch/bootstrap-switch.min.css', 'css/pages/sales.css'],
        script: ['/vendors/bootstrap-switch/bootstrap-switch.min.js', '/js/app/utilities.js', '/js/pages/sales.js']
    });
});

/* GET sale page. */
router.get('/novo', function (req, res, next) {
    res.render('sale', {
        title: 'DAV',
        css: [
            '/vendors/select2/dist/css/select2.min.css',
            '/vendors/bootstrap-daterangepicker/daterangepicker.css',
            '/vendors/bootstrap-dialog/css/bootstrap-dialog.min.css',
            '/vendors/bootstrap-validator/dist/css/bootstrapValidator.min.css',
            '/css/pages/sales.css'
        ],
        script: [
            '/vendors/amplify/amplify.min.js',
            '/vendors/schrollTo/jquery.scrollTo.min.js',
            '/vendors/knockout/knockout-3.4.0.js',
            '/vendors/select2/dist/js/select2.min.js',
            '/vendors/select2/dist/js/i18n/pt-BR.js',
            '/vendors/bootstrap-daterangepicker/daterangepicker.js',
            '/vendors/typeahead/typeahead.bundle.min.js',
            '/vendors/bootstrap-dialog/js/bootstrap-dialog.min.js',
            '/vendors/jquery.inputmask/dist/min/jquery.inputmask.bundle.min.js',
            '/vendors/bootstrap-validator/dist/js/bootstrapValidator.min.js',
            '/vendors/bootstrap-validator/dist/js/language/pt_BR.js',
            '/js/app/utilities.js',
            '/js/pages/saleViewModel.js',
            '/js/pages/sale.js'
        ]
    });
});

/* GET sale page. */
router.get('/:id', function (req, res, next) {
    res.render('sale', {
        title: 'DAV',
        css: [
            '/vendors/select2/dist/css/select2.min.css',
            '/vendors/bootstrap-daterangepicker/daterangepicker.css',
            '/vendors/bootstrap-dialog/css/bootstrap-dialog.min.css',
            '/vendors/bootstrap-validator/dist/css/bootstrapValidator.min.css',
            '/vendors/sweetAlert2/css/sweetalert2.min.css',
            '/css/pages/sales.css'
        ],
        script: [
            '/vendors/select2/dist/js/select2.min.js',
            '/vendors/select2/dist/js/i18n/pt-BR.js',
            '/vendors/bootstrap-daterangepicker/daterangepicker.js',
            '/vendors/typeahead/typeahead.bundle.min.js',
            '/vendors/bootstrap-dialog/js/bootstrap-dialog.min.js',
            '/vendors/jquery.inputmask/dist/min/jquery.inputmask.bundle.min.js',
            '/vendors/bootstrap-validator/dist/js/bootstrapValidator.min.js',
            '/vendors/bootstrap-validator/dist/js/language/pt_BR.js',
            '/vendors/sweetAlert2/js/sweetalert2.min.js',
            '/js/app/utilities.js',
            '/js/pages/saleViewModel.js',
            '/js/pages/sale.js'
        ],
        // helpers: require("handlebars-form-helpers"),
        sale: req.params.id
    });
});

module.exports = router;