var express = require('express');
var router = express.Router();
var Firebase = require("firebase");
var ref = new Firebase("https://senior-design.firebaseio.com");
var microcontrollerRef = ref.child("android");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('microcontroller', { title: 'Microcontroller' });
});

/* GET users listing. */
router.post('/', function(req, res, next) {
  var locationData = req.body;
  console.log(locationData);
  for (var key in locationData) {

  	var key = key;
  	var val = locationData[key];
  	var error = false;
  	var checkError = function(error) {
  		if (error) {
  			error = true;
  			console.log("Data Not Sent Successfully!")
  		} else {
  			console.log("Data Successfully Put In DB!")
  		}
  	};
  	var keyRef = microcontrollerRef.child(keyRef);
  	keyRef.set({
		key: val
  	}, checkError);
  }
  if (error) {
	res.send('Error: Data Not Put In Firebase');
  } else {
  	res.send("Success!")
  }
});



module.exports = router;
