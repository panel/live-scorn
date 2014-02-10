(function () {
	'use strict';

	var MongoClient = require('mongodb').MongoClient;

	var host = 'localhost';
	var port = 27017;

	var comments;

	console.log('Connecting to ' + host + ':' + port);
	MongoClient.connect('mongodb://localhost:27017/scorn', function (err, db) {
		comments = db.collection('comments');
	});

	function addComment(comment) {
		comments.insert(comment, function (a, b) {
			console.log(a, b);
		});
	}

	function findComments(timestamp) {
		var start = timestamp || Date.now();
		var options = {
			'sort': 'timestamp',
			'limit': 50
		};
		return comments.find({timestamp: {$lt: start}}, options);
	}

	exports.insert = addComment;
	exports.find = findComments;
}());