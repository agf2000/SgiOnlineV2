var express = require("express");
var productsController = require("../controllers/productsController");
var clientsController = require("../controllers/clientsController");

var router = express.Router();

router.get("/getUserInfo", function (req, res) {
	res.json(res.locals.user);
});

router.get('/getProducts', function (req, res) {
	productsController.getProducts(req, res, req.query.orderBy, req.query.orderDir, req.query.pageIndex, req.query.pageSize, req.query.searchFor);
});

router.get('/getProduct/:productId/:orderBy/:orderDir', function (req, res) {
	productsController.getProduct(req, res, req.params.productId, req.params.orderBy, req.params.orderDir);
});

router.get('/getClients', function (req, res) {
	clientsController.getClients(req, res, req.query.orderBy, req.query.orderDir, req.query.pageIndex, req.query.pageSize, req.query.searchFor);
});

router.get('/getClient', function (req, res) {
	clientsController.getClient(req, res, req.query.id, (req.query.orderBy || "codigo"), (req.query.orderDir || "desc"));
});

router.get('/removeClient/:id', function (req, res) {
	clientsController.removeClient(req, res, req.params.id);
});

router.post('/validateUser', function (req, res) {
	clientsController.validateUser(req, res, req.body);
});

router.get('/getTelephones/:clientId', function (req, res) {
	clientsController.getTelephones(req, res, req.params.clientId);
});

module.exports = router;