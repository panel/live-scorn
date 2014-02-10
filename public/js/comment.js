/*global marked, moment, document */
var Scorn = Scorn || {};

(function (ns) {
	'use strict';

	function linkify(string) {
        //var addTarget = /<a href/gim;
        return string;//.replace(addTarget, '<a target="_blank" href');
    }

	ns.Comment = function (handle, comment, homepage, timestamp) {
		this.handle = handle;
		this.comment = comment;
		this.homepage = homepage || null;
		this.timestamp = timestamp || Date.now();
	};

	ns.Comment.prototype.printComment = function () {
		if (this.comment) {
			var formatted = linkify(marked(this.comment));
			return formatted;
		}
		return this.comment;
	};

    ns.Comment.prototype.formattedTime = function () {
        return moment(this.timestamp).format('M.D.YYYY - HH:mm:ssa');
    };

}(Scorn));

(function (ns) {
    'use strict';
    ns.Cookie = {};

    ns.Cookie.createCookie = function (name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }
        else {
            expires = '';
        }
        document.cookie = name + '=' + value + expires + '; path=/';
    };

    ns.Cookie.readCookie = function (name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    };

}(Scorn));
