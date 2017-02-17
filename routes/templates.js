var express = require("express");

var router = express.Router();

router.get('/addressForm', function (req, res, next) {
    res.render('templates/addressForm', {
        layout: false,
        title: 'Endereço'
        // css: ['css/pages/clients.css'],
        // script: ['/js/app/utilities.js', '/js/templates/addressForm.js']
    });
});

module.exports = router;