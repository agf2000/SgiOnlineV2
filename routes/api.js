var express = require("express");
var jsonData = require("../data/jsonData.json");
var users = require("../data/users.json");
var productsController = require("../controllers/productsController");
var peopleController = require("../controllers/peopleController");
var servicesController = require("../controllers/servicesController");
var salesController = require("../controllers/salesController");

var router = express.Router();

router.get("/getUserInfo", function (req, res) {
	res.json(users);
});

router.get('/getProducts', function (req, res) {
	productsController.getProducts(req, res, req.query.orderBy, req.query.orderDir, req.query.pageIndex, req.query.pageSize, req.query.searchFor);
});

router.get('/getProduct/:productId/:orderBy/:orderDir', function (req, res) {
	productsController.getProduct(req, res, req.params.productId, req.params.orderBy, req.params.orderDir);
});

router.get('/getClients', function (req, res) {
	peopleController.getClients(req, res, req.query.orderBy, req.query.orderDir, req.query.pageIndex, req.query.pageSize, req.query.searchFor);
});

router.get('/getClient', function (req, res) {
	peopleController.getClient(req, res, req.query.id, (req.query.orderBy || "codigo"), (req.query.orderDir || "desc"));
});

router.get('/removeClient/:id', function (req, res) {
	peopleController.removeClient(req, res, req.params.id);
});

router.post('/validateUser', function (req, res) {
	peopleController.validateUser(req, res, req.body);
});

router.get('/getTelephones/:clientId', function (req, res) {
	peopleController.getTelephones(req, res, req.params.clientId);
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
	peopleController.addClient(req, res, req.body);
});

router.put('/saveClient', function (req, res) {
	peopleController.updateClient(req, res, req.body);
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

router.get('/getSales', function (req, res) {
	salesController.getSales(req, res, req.query.orderBy, req.query.orderDir, req.query.pageIndex, req.query.pageSize, req.query.sgiId, req.query.searchFor);
});

router.get('/getSaleItems', function (req, res) {
	salesController.getSaleItems(req, res, req.query.saleId);
});

router.get('/getSale/:saleId/:sgiId', function (req, res) {
	salesController.getSale(req, res, req.query.saleId, req.query.sgiId);
});

router.get('/getStoreSettings', function (req, res) {
	servicesController.getStoreSettings(req, res);
});

router.get('/getPeople', function (req, res) {
	peopleController.getPeople(req, res, (req.query.type || 1), (req.query.orderBy || 'nome'),
		(req.query.orderDir || 'ASC'), (req.query.pageIndex || 1), (req.query.pageSize || 10), req.query.searchFor);
});

module.exports = router;