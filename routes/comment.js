(function () {
	'use strict';

	// var md = require('marked');
	var Guid = require('guid');
	var mongo = require('./mongo.js');
	var Promise = require('promise');

	// function _replaceTag(comment, old, diff) {
	// 	var regEx = new RegExp('<' + old + '>([^<]+</' + old + '>', 'gi');
	// 	return comment.replace(regEx, '<' + diff + '>$1</' + diff + '>');
	// }

	// function _replaceLineBreaks(comment) {
	// 	var formatted = comment.replace(/\n{2,}/g, '</p><p>');
	// 	formatted = formatted.replace(/\n/g, '<br/>\n');
	// 	formatted = formatted.replace(/<\/p><p>/g, '</p>\n<p>');
	// 	return '<p>' + formatted + '</p>';
	// }

	function Comment(handle, comment, homepage, timestamp) {
		var guid = Guid.create();
		this.handle = handle;
		this.comment = comment;
		// this.display = this.printComment();
		this.homepage = homepage || null;
		this.timestamp = timestamp || Date.now();
		this.id = this.timestamp + '-' + guid.value;
	}

	// Comment.prototype.printComment = function () {
	// 	if (this.comment) {
	// 		var formatted = md(linkify(this.comment));
	// 		return formatted;
	// 	}
	// 	return this.comment;
	// };

	Comment.prototype.save = function () {
		mongo.insert({handle: this.handle, comment: this.comment, homepage: this.homepage, id: this.id, timestamp: this.timestamp});
	};

	exports.Post = Comment;
	exports.find = function (timestamp) {
		return new Promise(function (resolve, reject) {
			mongo.find(timestamp).toArray(function (err, array) {
				return (err) ? reject(err) : resolve(array);
			});
		});
	};

}());