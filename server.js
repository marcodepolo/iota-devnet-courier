'use strict';

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var router = express.Router();
 
var path = __dirname + '/views/';

let port = process.env.PORT;
if (port == null || port == "") {
  port = PORT;
}
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.listen(port, HOST);
console.log(`Running on http://${HOST}:${port}`);
app.use("/",router);

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});
 
router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});
 
router.get("/about",function(req,res){
  res.sendFile(path + "about.html");
});

app.post('/toTrytes',function(req,res){
  var bytesMsg = req.body.bytesMsg;
  res.send(iota.utils.toTrytes(bytesMsg));
});

app.post('/sendTransaction',function(req,res){
  var receiver = req.body.receiver;
  var msgTrytes = req.body.msgTrytes;
  var tagTrytes = req.body.tagTrytes;
  var value = parseInt(req.body.value);
  try{
	  sendTransaction(receiver, msgTrytes, tagTrytes, value)
	  res.send("transaction sent");
  }catch(error){
	  res.send("transaction not sent\n" + error);
  }

});


app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});


// Require the use of IOTA library
const IOTA = require('iota.lib.js')

// Create a new instance of the IOTA class object.
// Use 'provider' variable to specify which Full Node to talk to
const iota = new IOTA({ provider: 'https://nodes.devnet.iota.org:443' })

function getNodeInfo(){
	// Call the 'getNodeInfo call to check that the node is working
	iota.api.getNodeInfo((error, success) => {
		var output = "";
		if (error) {
			output = error
		} else {
			output = success
		}
		console.log(output)
	})
	// output is empty (sync issue with callback ?)
	return output
}
function sendHelloWord(){
	const seed =
	  'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD'
	const message = iota.utils.toTrytes('What a wonderful world!')
	
	const receiver = 'AKCWUGFHFGGU9WRGCMKLOXWNXMT9U9YSYIVXRXIFIVOOQSFEYEUOTATGOBUZVFACDWBHLXWBXSJSUPJOX9TTAXIFWY'
	
	const transfers = [
	  {
	    value: 0,
	    address: receiver,
	    message: message
	  }
	]
	
	iota.api.sendTransfer(seed, 3, 9, transfers, (error, success) => {
	  if (error) {
	    console.log(error)
	  } else {
	    console.log(success)
	  }
	})
}

function sendTransaction(receiver, msgTrytes, tagTrytes, value){
	const seed =
	  'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORL99'

    console.log('receiver: ' + receiver)
    console.log('msg: ' + msgTrytes)
    console.log('tag: ' + tagTrytes)
    console.log('value: ' + value)

	const transfers = [
	  {
	    value: value,
	    address: receiver,
	    message: msgTrytes,
	    tag: tagTrytes
	  }
	]

	iota.api.sendTransfer(seed, 3, 9, transfers, (error, success) => {
	  // this get called only on exception
		// if transaction fails (no funds on seed?) doesnt get called
		console.log('calledback')
	  if (error) {
		  console.log(error)
		  throw error
	  } else {
		  console.log(success)
	  }
	})
}