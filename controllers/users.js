var express = require("express");

var router = express.Router();

router.get("/getUserInfo", function(req, res){
	res.json(res.locals.user);
});