var express = require('express');
var router = express.Router();
var Fireproof = require('fireproof'),
  Firebase = require('firebase');
var ref = new Firebase("https://senior-design.firebaseio.com");
var microcontrollerRef = ref.child("microcontroller");
var androidRef = ref.child("android");
var Q = require('q');

// var tempRef = microcontrollerRef.child("1447653600")

// for (var i = 1; i < 8; i++) {
// 	var temptempRef = tempRef.child(i);
// 	temptempRef.remove();
// 	console.log("Removed");
// }

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
				var power = microcontrollerMillisecondObject[milliseconds];
				cleanMicrocontrollerData[unixMilliseconds] = power;
			}
		}

		var androidKeys = Object.keys(cleanAndroidData);
		var microcontrollerKeys = Object.keys(cleanMicrocontrollerData);	

		androidKeys.sort();
		microcontrollerKeys.sort();

		var androidIndex = 0;
		var microcontrollerIndex = 0;
		var androidLength = androidKeys.length;
		var microcontrollerLength = microcontrollerKeys.length;
		var lastStep = 0;
		var lastPower = 0;
		var resultingData = [];
		var instantaneousData = [];
		// console.log("About to reorder data");
		while (androidIndex < androidLength || microcontrollerIndex < microcontrollerLength) {
			// console.log("While loop");
			// console.log(androidIndex, androidLength, microcontrollerLength, microcontrollerIndex);
			if (androidIndex >= androidLength) {
				var powerArray = (cleanMicrocontrollerData[microcontrollerKeys[microcontrollerIndex]]).split('-');
				resultingData.push({
                    date: new Date(parseInt(microcontrollerKeys[microcontrollerIndex])),
                    power: parseFloat(powerArray[1]) / 1000000,
                    steps: lastStep
				});
				instantaneousData.push({
                    date: new Date(parseInt(microcontrollerKeys[microcontrollerIndex])),
                    power: parseFloat(powerArray[0]),
                    steps: lastStep
				});
				microcontrollerIndex += 1;
				lastPower = parseFloat(powerArray[1]);
				continue;
			}
			if (microcontrollerIndex >= microcontrollerLength) {
				resultingData.push({
                    date: new Date(parseInt(androidKeys[androidIndex])),
                    power: lastPower,
                    steps: cleanAndroidData[androidKeys[androidIndex]]
				});
				instantaneousData.push({
                    date: new Date(parseInt(androidKeys[androidIndex])),
                    power: 0,
                    steps: cleanAndroidData[androidKeys[androidIndex]]
				});
				androidIndex += 1;
				lastStep = currentStep;
				continue;
			}
			var androidTimestamp = parseInt(androidKeys[androidIndex]);
			var currentStep = cleanAndroidData[androidKeys[androidIndex]];
			var microcontrollerTimestamp = parseInt(microcontrollerKeys[microcontrollerIndex]);
			var currentPowerArray = (cleanMicrocontrollerData[microcontrollerKeys[microcontrollerIndex]]).split('-');
			var currentEnergy = parseFloat(currentPowerArray[1]) / 1000000;
			var currentInstantPower = parseFloat(currentPowerArray[0]);
			if (androidTimestamp < microcontrollerTimestamp) {
				// lower android
				if (androidTimestamp < microcontrollerTimestamp - 100) {
					resultingData.push({
                        date: new Date(androidTimestamp),
                        power: lastPower,
                        steps: currentStep
					});
					instantaneousData.push({
                        date: new Date(androidTimestamp),
                        power: 0,
                        steps: currentStep
					});
					androidIndex += 1;
					lastStep = currentStep;
				} else {
					resultingData.push({
						date: new Date(androidTimestamp),
						power: currentEnergy,
						steps: currentStep
					});
					instantaneousData.push({
						date: new Date(androidTimestamp),
						power: currentInstantPower,
						steps: currentStep
					});
					androidIndex += 1;
					microcontrollerIndex += 1;
					lastStep = currentStep;
					lastPower = currentEnergy;
				}

			} else if (androidTimestamp == microcontrollerTimestamp) {
				// equal
				resultingData.push({
					date: new Date(androidTimestamp),
					power: currentEnergy,
					steps: currentStep
				});
				instantaneousData.push({
					date: new Date(androidTimestamp),
					power: currentInstantPower,
					steps: currentStep
				});
				androidIndex += 1;
				microcontrollerIndex += 1;
				lastStep = currentStep;
				lastPower = currentEnergy;
			} else {
				if (microcontrollerTimestamp < androidTimestamp - 100) {
					resultingData.push({
                        date: new Date(microcontrollerTimestamp),
                        power: currentEnergy,
                        steps: lastStep
					});
					instantaneousData.push({
						date: new Date(androidTimestamp),
						power: currentInstantPower,
						steps: currentStep
					});
					microcontrollerIndex += 1;
					lastPower = currentEnergy;
				} else {
					
					// equal
					resultingData.push({
						date: new Date(androidTimestamp),
						power: currentEnergy,
						steps: currentStep
					});
					instantaneousData.push({
						date: new Date(androidTimestamp),
						power: currentInstantPower,
						steps: currentStep
					});
					androidIndex += 1;
					microcontrollerIndex += 1;
					lastStep = currentStep;
					lastPower = currentEnergy;
				}
				// lower microcontroller
			}
		}

		// console.log(cleanAndroidData);
		// console.log(cleanMicrocontrollerData);
		console.log(resultingData);
	  	res.render("day", {unixDay : unixDate, relativePath : '../', 
	  		completeChartData: resultingData, completeInstantData: instantaneousData });
	});
});

module.exports = router;