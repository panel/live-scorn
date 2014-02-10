'use strict';
/*************************************
//
// sockets app
//
**************************************/

// connect to our socket server
var socket = io.connect('ws://live-scorn.herokuapp.com/');

var app = app || {};
var Scorn = Scorn || {};
(function (ns) {
	var $template = $('<div class="post"><div class="comment"></div><div class="meta"><span class="handle"></span> | <span class="timestamp"></span> | <a href="#form" class="quote">Quote</a></div></div>');
	var IMAGES = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp'];
	function _lightboxer(lightbox) {
		$('.comment a[href]').on('click', function (e) {
			var path = $(this).attr('href');
			var extension = path.split('.').pop();


			if (IMAGES.indexOf(extension) > -1 && lightbox) {
				e.preventDefault();
				ns.lightboxContent.html('<img src="' + path + '" />');
				ns.lightboxContent.parents('.fade').modal('toggle');
			}
		});
	}

	var linkSelector = '.comment a[href]';
	function _toggleLinks(newWindow, scope) {
		var links = (scope) ? scope.find(linkSelector) : $(linkSelector);
		if (newWindow) {
			links.attr('target', '_blank');
		} else {
			links.attr('target', '_self');
		}
	}

	function _persister(persist) {
		function _updateHandle() {
			ns.options.handle = ns.postForm.handle.val();
			Scorn.Cookie.createCookie('scorn-options', JSON.stringify(ns.options));
		}

		if (persist) {
			ns.postForm.handle.on('change', function () {
				_updateHandle();
			});

			_updateHandle();
		} else {
			Scorn.Cookie.createCookie('scorn-options', '{}');
			ns.postForm.handle.unbind('change');
		}
	}

	function _buildComment() {
		return new Scorn.Comment(ns.postForm.handle.val(), ns.postForm.comment.val());
	}

	function quoteFactory(post) {
		return function () {
			ns.postForm.comment.focus().val(function () {
				return [post.comment.replace(/^/gm, '> '), '> ', '> ' + post.handle + ' | ' + post.formattedTime(), '', ''].join('\n');
			});
		};
	}

	function printPost(post) {
		var content = $template.clone();
		var comment = new Scorn.Comment(post.handle, post.comment, post.homepage, post.timestamp);
		var contentComment = content.find('.comment');

		contentComment.html(comment.printComment());
		contentComment.find('a').text(function (i, text) {
			return (text.length > 30) ? text.substr(0, 30) + '...' : text;
		});
		content.find('.handle').text(comment.handle).on('click', function () {
			ns.postForm.comment.text(ns.postForm.comment.text() + '@' + comment.handle + ' ');
		});
		content.find('.timestamp').text(comment.formattedTime());
		content.find('.quote').on('click', quoteFactory(comment, ns.postForm.comment));
		ns.target.append(content);

		_lightboxer(ns.options.lightbox);
		_toggleLinks(ns.options.newWindow, content);
	}

	var more = $('#more');
	function showMore(show) {
		if (show) {
			more.fadeIn();
			window.onscroll = function () {
				showMore(false);
				window.onscroll = undefined;
			};
		} else {
			more.fadeOut();
		}
	}

	function _setUpSocketEvents() {
		// Listeners
		socket.on('blast', function (post) {
			printPost(post);
			showMore(true);
		});

		socket.on('posts', function (posts) {
			ns.target.html('');
			$.each(posts, function (stupid, post) {
				printPost(post);
			});
		});

		socket.on('readerCount', function (data) {
			ns.readerCount.text(data.count);
		});

		// Emiter
		ns.postForm.submit.on('click', function (e) {
			e.preventDefault();
			var post = _buildComment();

			if (post.comment.length && post.handle.length) {
				socket.emit('post', post,
					function () {
						ns.postForm.comment.val('');
					});
			}
		});
	}

	function _optionHandlerFactory(el) {
		return function () {
			var $input = el;
			switch ($input.attr('id')) {
			case 'pop':
				ns.options.newWindow = ns.optionInputs.newWindow.is(':checked') ? true : false;
				_toggleLinks(ns.options.newWindow);
				break;
			case 'lightbox':
				ns.options.lightbox = ns.optionInputs.lightbox.is(':checked') ? true : false;
				_lightboxer(ns.options.lightbox);
				break;
			}
			ns.options.persist = ns.optionInputs.persist.is(':checked') ? true : false;
			_persister(ns.options.persist);
		};
	}

	ns.init = function () {
		var cookieOptions = JSON.parse(Scorn.Cookie.readCookie('scorn-options')) || {};
		ns.optionInputs = {
			lightbox: $('#lightbox'),
			newWindow: $('#pop'),
			persist: $('#remember')
		};

		ns.postForm = {
			handle: $('#handle'),
			comment: $('#comment'),
			submit: $('#send')
		};

		ns.target = $('#allPosts');
		ns.readerCount = $('#readerCount');
		ns.lightboxContent = $('#lightbox-modal .modal-content');

		ns.options = {
			lightbox: !!cookieOptions.lightbox,
			newWindow: !!cookieOptions.newWindow,
			persist: !!cookieOptions.persist,
			handle: cookieOptions.handle || ''
		};

		// Set option inputs from the cookie
		ns.optionInputs.lightbox.attr('checked', ns.options.lightbox);
		ns.optionInputs.newWindow.attr('checked', ns.options.newWindow);
		ns.optionInputs.persist.attr('checked', ns.options.persist);
		ns.postForm.handle.val(ns.options.handle);

		_lightboxer(ns.options.lightbox);
		_toggleLinks(ns.options.newWindow);

		_setUpSocketEvents();
		for (var key in ns.optionInputs) {
			ns.optionInputs[key].on('change', _optionHandlerFactory(ns.optionInputs[key]));
		}

		window.onbeforeunload = function () {
		    socket.onclose = function () {}; // disable onclose handler first
		    socket.close();
		};

		$('#bottom').click(function () {
		    $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
		    return false;
		});
	};

}(Scorn));

// shortcut for document.ready
$(function () {
	Scorn.init();
});;var Scorn = Scorn || {};

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
