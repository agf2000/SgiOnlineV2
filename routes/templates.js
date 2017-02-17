var express = require("express");

var router = express.Router();

router.get('/addressForm', function (req, res, next) {
    res.render('templates/addressForm', {
        layout: false,
        title: 'Endereço'
    });
});

router.get('/classesForm', function (req, res, next) {
    res.render('templates/classesForm', {
        layout: false,
        title: 'Classes'
    });
});

module.exports = router;