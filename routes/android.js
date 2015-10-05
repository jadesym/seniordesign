var express = require('express');
var router = express.Router();
var Firebase = require("firebase");
var ref = new Firebase("https://senior-design.firebaseio.com");
var androidRef = ref.child("android");


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('android');
});

/* GET users listing. */
router.get('/sync', function(req, res, next) {
  res.send('android');
});

/* GET users listing. */
router.get('/time', function(req, res, next) {
  var time = process.hrtime();
  res.send((time[0] * 1e9 + time[1].toString()));
});


/* GET users listing. */
router.post('/xyz-data', function(req, res, next) {
  var locationData = req.body;
  console.log(locationData);
  for (var key in locationData) {

  	var timestamp = key;
  	var xyzCoords = locationData[key];
  	var xCoord = xyzCoords[0];
  	var yCoord = xyzCoords[1];
  	var zCoord = xyzCoords[2];
  	var error = false;
	var checkError = function(error) {
		if (error) {
			error = true;
			console.log("Data Not Sent Successfully!")
		} else {
			console.log("Data Successfully Put In DB!")
		}
	};
	var timestampRef = androidRef.child(timestamp);
  	timestampRef.set({
		"x" : xCoord,
		"y" : yCoord,
		"z" : zCoord 
  	}, checkError);
  }
  if (error) {
	res.send('Error: Data Not Put In Firebase');
  } else {
  	res.send("Success!")
  }
});

module.exports = router;
