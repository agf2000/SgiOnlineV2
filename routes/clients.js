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

/* GET clients page. */
router.get('/', function (req, res, next) {
  res.render('clients', {
    title: 'Clientes',
    css: ['css/pages/clients.css'],
    script: ['/js/app/utilities.js', '/js/pages/clients.js']
  });
});

/* GET client page. */
router.get('/novo', function (req, res, next) {
  res.render('client', {
    title: 'Cadastro de Cliente',
    css: [
      '/vendors/select2/dist/css/select2.min.js',
      '/vendors/bootstrap-daterangepicker/daterangepicker.css',
      '/css/pages/client.css'
    ],
    script: [
      '/vendors/select2/dist/js/select2.min.js',
      '/vendors/select2/dist/js/i18n/pt-BR.js',
      '/vendors/bootstrap-daterangepicker/daterangepicker.js',
      '/js/app/utilities.js',
      '/js/pages/client.js'
    ]
  });
});

/* GET client page. */
router.get('/:id', function (req, res, next) {
  res.render('client', {
    title: 'Cliente',
    css: [
      '/vendors/select2/dist/css/select2.min.css',
      '/vendors/bootstrap-daterangepicker/daterangepicker.css',
      '/vendors/bootstrap-dialog/css/bootstrap-dialog.min.css',
      '/css/pages/client.css'
    ],
    script: [
      '/vendors/select2/dist/js/select2.full.min.js',
      // '/vendors/select2/dist/js/i18n/pt-BR.js',
      '/vendors/bootstrap-daterangepicker/daterangepicker.js',
      '/vendors/typeahead/typeahead.bundle.min.js',
      '/vendors/bootstrap-dialog/js/bootstrap-dialog.min.js',
      '/vendors/jquery.inputmask/dist/min/jquery.inputmask.bundle.min.js',
      '/vendors/bootstrap-validator/dist/validator.min.js',
      '/js/app/utilities.js',
      '/js/pages/client.js'
    ],
    // helpers: require("handlebars-form-helpers"),
    // client: data[0]
  });
});

/*router.get('/:id/:orderBy/:orderDir', function (req, res, next) {
  var id = req.params.id,
      orderBy = req.params.orderBy,
      orderDir = req.params.orderDir;
  
  var sqlInst = "select c.*, vc.*, " +
  "(select top 1 codigo from cliente where " + orderBy + " " + (orderDir == "asc" ? "<" : ">") + " c." + orderBy + " order by " + orderBy + (orderDir == "desc" ? "" : " desc") + ") as anterior, " +
  "(select top 1 codigo from cliente where " + orderBy + " " + (orderDir == "asc" ? ">" : "<") + " c." + orderBy + " order by " + orderBy + (orderDir == "desc" ? " desc" : "") + ") as proximo " +
  "from cliente c inner join view_valida_cliente vc on c.codigo = vc.pessoa where c.codigo = " + id;

  db.querySql(sqlInst,
    function (data, err) {
      if (err) {
        res.writeHead(500, "Internal Server Error", {
          "Content-Type": "text/html"
        });
        res.write("<html><title>500</title><body>500: Internal Server Error. Details: " + err + "</body></html>");

        res.end();
      } else {
        res.render('client', {
          title: 'Cliente',
          css: [
            '/vendors/select2/dist/css/select2.min.css', 
            '/vendors/bootstrap-daterangepicker/daterangepicker.css', 
            '/css/pages/client.css'
            ],
          script: [
            '/vendors/select2/dist/js/select2.full.min.js', 
            '/vendors/select2/dist/js/i18n/pt-BR.js', 
            '/vendors/bootstrap-daterangepicker/daterangepicker.js', 
            '/vendors/typeahead/typeahead.bundle.min.js', 
            '/vendors/bootstrap-select/js/bootstrap-select.min.js', 
            '/js/app/utilities.js', 
            '/js/pages/client.js'
            ],
          // helpers: require("handlebars-form-helpers"),
          // client: data[0]
        });
      }
    });
});*/

module.exports = router;