var express = require('express');
var router = express.Router();
var Fireproof = require('fireproof'),
  Firebase = require('firebase');
var ref = new Firebase("https://senior-design.firebaseio.com");
var microcontrollerRef = ref.child("microcontroller");
var Q = require('q');

Fireproof.bless(Q);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('microcontroller', { title: 'Microcontroller' });
});

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

function unixPureTime(timeOfRecording) {
  var hours = timeOfRecording.getHours();
  var minutes = timeOfRecording.getMinutes();
  var seconds = timeOfRecording.getSeconds();
  var milliseconds = timeOfRecording.getMilliseconds();
  var resultUnix = hours;
  // console.log(hours + ":" + minutes + ":" + seconds + ":" + milliseconds);
  resultUnix = resultUnix * 60 + minutes;
  resultUnix = resultUnix * 60 + seconds;
  resultUnix = resultUnix * 1000 + milliseconds;
  return resultUnix;
}

/* GET users listing. */
router.post('/', function(req, res, next) {
  var rightNow = new Date();
  // console.log(rightNow.getTime());
  // var currentSeconds = rightNow.getTime() / 1000;
  // var momentNow = moment(currentSeconds);
  // console.log(currentSeconds);
  // console.log(momentNow.millisecond());
  // console.log(momentNow.second());

  var voltageData = req.body;
  // console.log(voltageData);
  var returnString = "";
  var failures = 0;
  var successes = 0;
  var allKeys = Object.keys(voltageData);
  var maxTimestamp = allKeys.max();
  var lastKey = allKeys[allKeys.length - 1];
  var totalAsyncCalls = [];
  allKeys.forEach(function(key, index) {
    var diff = (maxTimestamp - parseInt(key)).toString();

    // console.log("Entering for loop" + allKeys.toString());
    var voltageValue = parseFloat(voltageData[key]);
    // console.log(key + voltageValue);
    // var originalMoment = moment(currentSeconds);
    // console.log("Original Unix: " + rightNow.getTime());
    var timeOfRecording = new Date(rightNow - diff);
    // console.log("Original Unix: " + timeOfRecording.getTime());
    var currentDay = (timeOfRecording.getTime() - timeOfRecording.getHours() * 60 * 60 * 1000
      - timeOfRecording.getMinutes() * 60 * 1000 - timeOfRecording.getSeconds() * 1000 
      - timeOfRecording.getMilliseconds()) / 1000;
    var currentHour = timeOfRecording.getHours();
  	var checkError = function(error) {
  		if (error) {
        var errorString = key + "-" + voltageValue + ":Failed!\n";
  			// console.log(errorString);
        returnString += errorString;
        failures += 1;
        // console.log("Error " + failures);
  		} else {
        var successString = key + "-" + voltageValue + ":Success!\n";
        // console.log(successString);
        returnString += successString;
        successes += 1;
        // console.log("Success " + successes);
  		}
  	}
    var justTheTime = unixPureTime(timeOfRecording); 
  	var keyRef = microcontrollerRef.child(currentDay).child(currentHour).child(justTheTime),
      fireproofKeyRef = new Fireproof(keyRef);
    // console.log(failures +":" + successes);
  	totalAsyncCalls.push(
      fireproofKeyRef.set(voltageValue).then(
        checkError
      )
    );
  });
  // console.log("Number of Async Calls: " + totalAsyncCalls.length);
  Q.allSettled(totalAsyncCalls).then(function(results) {
    res.send("Successes: " + successes.toString() + " Failures: " + failures.toString() + "\n" + returnString);
  });
});



module.exports = router;
