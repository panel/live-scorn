/*************************************
//
// sockets app
//
**************************************/
'use strict';

// express magic
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var device  = require('express-device');
var Comment = require('./routes/comment');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/scorn');


var runningPortNumber = process.env.PORT;


app.configure(function () {
	// I need to access everything in '/public' directly
	app.use(express.static(__dirname + '/public'));

	//set the view engine
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');

	app.use(device.capture());
});


// logs every request
app.use(function (req, res, next) {
	// output every request in the array
	console.log({method:req.method, url: req.url, device: req.device});
	// goes onto the next function in line
	next();
});

app.get('/', function (req, res) {
	res.render('index', {});
});

var readerCount = 0;

io.sockets.on('connection', function (socket) {
	readerCount++;
	io.sockets.emit('readerCount', {count: readerCount});

	Comment.find(Date.now()).then(function (comments) {
		socket.emit('posts', comments);
	});


	socket.on('post', function (data, fn) {
		var  comment = new Comment.Post(data.handle, data.comment, data.homepage);
		console.log(comment);
		comment.save();
		io.sockets.emit('blast', comment);

		fn();//call the client back to clear out the field
	});

	socket.on('disconnect', function () {
		readerCount--;
		io.sockets.emit('readerCount', {count: readerCount});
	});


});

io.sockets.on('disconnect', function () {
	readerCount--;
	io.sockets.emit('readerCount', {count: readerCount});
});


server.listen(runningPortNumber);

