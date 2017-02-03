var express = require("express");
var productsController = require("../controllers/productsController");

var router = express.Router();

router.get("/getUserInfo", function(req, res){
	res.json(res.locals.user);
});

router.get('/getProducts', function (req, res) {
	productsController.getProducts(req, res, req.query.orderBy, req.query.orderDir, req.query.pageIndex, req.query.pageSize, req.query.searchFor);
});

router.get('/getProduct/:productId/:orderBy/:orderDir', function (req, res) {
	productsController.getProduct(req, res, req.params.productId, req.params.orderBy, req.params.orderDir);
});

module.exports = router;
