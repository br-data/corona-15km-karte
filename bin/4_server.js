"use strict"

const express = require('express');
const expressStaticGzip = require('express-static-gzip');
const {resolve} = require('path');

const port = 3000;

const app = express();

app.use('/', expressStaticGzip(resolve(__dirname, '../publish/')));

app.listen(port, () => {
	console.log('listening at port '+port)
})
