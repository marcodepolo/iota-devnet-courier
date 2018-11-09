'use strict';

const express = require('express');
const cool = require('cool-ascii-faces')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.get('/cool', (req, res) => res.send(cool()));

let port = process.env.PORT;
if (port == null || port == "") {
  port = PORT;
}
app.listen(port, HOST);
console.log(`Running on http://${HOST}:${port}`);

