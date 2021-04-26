var express = require('express');
var router = express.Router();
const querySql = require('../api/querySql')

router.get('/put', function(req, res, next) {
    // res.render('index', { title: 'Express' });
    res.send()
});

module.exports = router;