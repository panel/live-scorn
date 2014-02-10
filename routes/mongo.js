(function () {
	'use strict';

	var Mongo = require('mongodb');

	var comments;
	var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/scorn';

	if (process.env.pwd === '/app' && !(process.env.MONGOHQ_URL || process.env.MONGOLAB_URI)) {
		console.log(process.env);
		throw 'process env not initialize';
	}

	console.log('Connecting to ' + mongoUri);
	Mongo.Db.connect(mongoUri, function (err, db) {
		if (err) {
			console.log(err);
		} else {
			comments = db.collection('comments');
		}
	});

	function addComment(comment) {
		comments.insert(comment, function (a, b) {
			if (a) {
				console.log(a);
			} else {
				return b;
			}
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