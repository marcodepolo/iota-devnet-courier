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
  res.send(converter.asciiToTrytes(bytesMsg));
});

app.post('/sendTransaction',function(req,res){
  var receiver = req.body.receiver;
  var msgTrytes = req.body.msgTrytes;
  var tagTrytes = req.body.tagTrytes;
  var value = parseInt(req.body.value);
  sendTransaction(res, receiver, msgTrytes, tagTrytes, value)

});


app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

//Require the use of IOTA library
const composeAPI = require("@iota/core");
// converter module required to convert ascii msg to trytes
const converter = require('@iota/converter')

const iota = composeAPI.composeAPI({
    provider: 'https://nodes.devnet.iota.org:443'
})

//IOTA node 
const provider = 'https://nodes.devnet.iota.org:443'



	
// subscribe to events so we can receive notifications when tx is live.
// broken on install (had to install node-legacy on ubuntu for npm install to work
// still broken after install
// Error: /usr/lib/x86_64-linux-gnu/libstdc++.so.6: version `GLIBCXX_3.4.21' not found (required by /home/node/app/node_modules/zeromq/build/Release/zmq.node)

/*let zmq = require('zeromq')
let sock = zmq.socket('sub')

sock.connect('tcp://zmq.devnet.iota.org:5556')
sock.subscribe('tx')
sock.subscribe('sn')	
*/
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

function sendTransaction(res, receiver, msgTrytes, tagTrytes, value){
	// this seed has a few dev iota
/*	const seed =
	  'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD'
*/
	// this seed has about 2k dev iota
	const seed =
		  'BFUXLVTHVAZDSODQDBGAXMBKPEKOVTMGTTPQFUTOU9DPJOZQMOXJUNZSFIGPSKBJLXGUHYJZSXTCUDCGX'
		
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
	
	try{
		// Prepare a bundle and signs it
		iota.prepareTransfers(seed, transfers)
		      .then(trytes => {
		          // Persist trytes locally before sending to network.
		          // This allows for reattachments and prevents key reuse if trytes can't
		          // be recovered by querying the network after broadcasting.
		
		          // Does tip selection, attaches to tangle by doing PoW and broadcasts.
		          return iota.sendTrytes(trytes, 3, 9)
		      })
		      .then(bundle => {
		          console.log(`Published transaction with tail hash: ${bundle[0].hash}`)
		          console.log(`Bundle: ${bundle}`)
		          res.send(JSON.stringify(bundle, null, '\t'))
		      })
		      .catch(err => {
		          // catch any errors
		          console.log("Error:", err);
		          res.send("transaction not sent\n" + err)
		      })	
	}catch(err){
		// catch Invalid transfer object errors
        console.log("Error prepareTransfer:", err);
        res.send("transaction not sent\n" + err)
	}
}

// could use this to push notifications back to the web page ?
/*sock.on('message', msg => {
	  const data = msg.toString().split(' ') // Split to get topic & data
	  switch (
	    data[0] // Use index 0 to match topic
	  ) {
	    case 'tx':
	      console.log(`I'm a TX!`, data)
	      break
	    case 'sn':
	      console.log(`I'm a confirmed TX`, data)
	      break
	  }
})*/