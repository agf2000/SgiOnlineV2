var express = require("express");
var productsController = require("../controllers/productsController");
var clientsController = require("../controllers/clientsController");
var servicesController = require("../controllers/servicesController");
var jsonData = require("../data/jsonData");

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

router.get('/getAddress/:postalCode', function (req, res) {
	servicesController.getAddress(req, res, req.params.postalCode);
});

router.get('/getCountries/:filter', function (req, res) {
	servicesController.getCountries(req, res, req.params.filter);
});

router.get('/getClasses', function (req, res) {
	servicesController.getClasses(req, res, req.query.filter, req.query.pageIndex, req.query.pageSize);
});

router.get('/getRegions', function (req, res) {
	servicesController.getRegions(req, res, req.query.filter, req.query.pageIndex, req.query.pageSize);
});

router.get('/getJSONData', function (req, res) {
	res.send(jsonData);
});

router.get('/getProfessions/:filter', function (req, res) {
	servicesController.getProfessions(req, res, req.params.filter);
});

router.post('/saveAddress', function (req, res) {
	servicesController.saveAddress(req, res, req.body);
});

router.get('/getCities/:filter', function (req, res) {
	servicesController.getCities(req, res, req.params.filter);
});

router.post('/saveClient', function (req, res) {
	clientsController.addClient(req, res, req.body);
});

router.put('/saveClient', function (req, res) {
	clientsController.updateClient(req, res, req.body);
});

router.post('/saveTelephone', function (req, res) {
	servicesController.saveTelephone(req, res, req.body);
});

router.put('/saveTelephone', function (req, res) {
	servicesController.updateTelephone(req, res, req.body);
});

router.delete('/removeTelephone/:id', function (req, res) {
	servicesController.removeTelephone(req, res, req.params.id);
});

module.exports = router;