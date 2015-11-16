var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:unixDay', function(req, res, next) {
  res.render("day", {unixDay : req.param('unixDay'), relativePath : '../' });
});

module.exports = router;