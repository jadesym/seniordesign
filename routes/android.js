var express = require('express');
var router = express.Router();
var Fireproof = require('fireproof'),
  Firebase = require('firebase');
var ref = new Firebase("https://senior-design.firebaseio.com");
var androidRef = ref.child("android");
// var moment = require('moment');
var Q = require('q');

Fireproof.bless(Q);

var num_times = 0;
var sum_times = 0;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Android' });
});

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

router.post('/', function(req, res, next) {
  var stepData = req.body;
  // console.log(stepData);
  var rightNow = new Date();
  // console.log(rightNow.getTime());
  var returnString = "";
  var failures = 0;
  var successes = 0;
  var allKeys = Object.keys(stepData);
  var lastKey = allKeys[allKeys.length - 1];
  var totalAsyncCalls = [];
  allKeys.forEach(function(key, index) {
    // console.log("Entering for loop" + allKeys.toString());
    var stepValue = stepData[key];
    // console.log(key + stepValue);
    // var originalMoment = moment(currentSeconds);
    // console.log("Original Unix: " + rightNow.getTime());
    var timeOfRecording = new Date(rightNow - key);
    // console.log("Original Unix: " + timeOfRecording.getTime());
    var currentDay = (timeOfRecording.getTime() - timeOfRecording.getHours() * 60 * 60 * 1000
      - timeOfRecording.getMinutes() * 60 * 1000 - timeOfRecording.getSeconds() * 1000 
      - timeOfRecording.getMilliseconds()) / 1000;
    var currentHour = timeOfRecording.getHours();
    var checkError = function(error) {
      if (error) {
        var errorString = key + "-" + stepValue + ":Failed!\n";
        // console.log(errorString);
        returnString += errorString;
        failures += 1;
        // console.log("Error " + failures);
      } else {
        var successString = key + "-" + stepValue + ":Success!\n";
        // console.log(successString);
        returnString += successString;
        successes += 1;
        // console.log("Success " + successes);
      }
    }
    var justTheTime = unixPureTime(timeOfRecording); 
    var keyRef = androidRef.child(currentDay).child(currentHour).child(justTheTime),
      fireproofKeyRef = new Fireproof(keyRef);
    // console.log(failures +":" + successes);
    totalAsyncCalls.push(
      fireproofKeyRef.set(stepValue).then(
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
