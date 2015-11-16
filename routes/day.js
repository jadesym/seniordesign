var express = require('express');
var router = express.Router();
var Fireproof = require('fireproof'),
  Firebase = require('firebase');
var ref = new Firebase("https://senior-design.firebaseio.com");
var microcontrollerRef = ref.child("microcontroller");
var androidRef = ref.child("android");
var Q = require('q');

/* GET home page. */
router.get('/:unixDay', function(req, res, next) {
	
	var unixDate = req.param('unixDay');
	var unixAndroidRef = androidRef.child(unixDate),
		androidFireproof = new Fireproof(unixAndroidRef);

	
	var unixMicrocontrollerRef = microcontrollerRef.child(unixDate),
		microcontrollerFireproof = new Fireproof(unixMicrocontrollerRef);

	var totalAsyncCalls = [];
	var androidObject = {};
	var microcontrollerObject = {};
	totalAsyncCalls.push(
		androidFireproof.once("value", function(snap) {
			androidObject = snap.val();
		})
	);

	totalAsyncCalls.push(
		microcontrollerFireproof.once("value", function(snap) {
			microcontrollerObject = snap.val();
		})
	);

	Q.allSettled(totalAsyncCalls).then(function(results) {
		// console.log(microcontrollerObject);
		// console.log(androidObject);
		var originalDate = new Date(unixDate * 1000);
		// console.log(unixDate);
		// console.log("has not entered yet");
		var cleanAndroidData = {};
		for (var hour in androidObject) {
			var numHour = parseInt(hour);
			// console.log(numHour);
			var hourDate = new Date(originalDate);
			hourDate.setHours(numHour);
			var androidMillisecondObject = androidObject[hour];
			for (var milliseconds in androidMillisecondObject) {
				var numMilliseconds = parseInt(milliseconds);
				var unixMilliseconds = hourDate.getTime() + numMilliseconds;

				// console.log(parseInt(unixMilliseconds));
				var steps = androidMillisecondObject[milliseconds];
				cleanAndroidData[unixMilliseconds] = steps;
			}
		}

		var cleanMicrocontrollerData = {};
		for (var hour in microcontrollerObject) {
			var numHour = parseInt(hour);
			// console.log(numHour);
			var hourDate = new Date(originalDate);
			hourDate.setHours(numHour);
			var microcontrollerMillisecondObject = microcontrollerObject[hour];
			for (var milliseconds in microcontrollerMillisecondObject) {
				var numMilliseconds = parseInt(milliseconds);
				var unixMilliseconds = hourDate.getTime() + numMilliseconds;

				// console.log(parseInt(unixMilliseconds));
				var steps = microcontrollerMillisecondObject[milliseconds];
				cleanMicrocontrollerData[unixMilliseconds] = steps;
			}
		}
		// console.log(cleanAndroidData);
		// console.log(cleanMicrocontrollerData);
	  	res.render("day", {unixDay : unixDate, relativePath : '../', 
	  		androidData: cleanAndroidData, microcontrollerData: cleanMicrocontrollerData });
	});
});

module.exports = router;