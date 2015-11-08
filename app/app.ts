/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import * as express from 'express';

var app = express();

app.use('/', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/public/index.html');
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log(`Example app listening at http://${host}:${port}`);
});
