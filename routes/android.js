var express = require('express');
var router = express.Router();
var Firebase = require("firebase");
var ref = new Firebase("https://senior-design.firebaseio.com");
var androidRef = ref.child("android");

var num_times = 0;
var sum_times = 0;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Android' });
});

/* GET users listing. */
router.get('/sync-init', function(req, res, next) {
  console.log("New get request to initialize syncing");
  // Will now accept 100 get requests twice a second
  num_times = 0;
  times_array = [];
  res.send('Syncing has been initialized!');
});

/* GET users listing. */
router.get('/time/:androidTime', function(req, res, next) {
  currentAndroidTime = req.params.androidTime;
  var time = process.hrtime();
  var serverTimeInNanoseconds = time[0] * 1e9 + time[1];
  var current_offset = serverTimeInNanoseconds - currentAndroidTime;
  num_times += 1;
  sum_times += current_offset;
  res.send("Successfully received " + num_times.toString() + " times: " 
    + currentAndroidTime.toString());
});

router.get('/get-offset', function(req, res, next) {
  res.send("Average Offset Ping: " + (sum_times / num_times).toString())
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
