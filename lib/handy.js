// a set of handy tools

module.exports.debounce = function(fn, timeout) {
	var id;
	var fn2 = function() {
		fn.apply(this, arguments);
		id = null;
	}
	return function() {
		if (!id) {
			id = setTimeout(fn2, timeout);
		} else {
			clearTimeout(id);
			id = setTimeout(fn2, timeout);
		}
	}
};

module.exports.merge = function(src, dest) {
	for (var key in src) {
		if (typeof dest[key] != 'undefined' && typeof src[key] != 'undefined') {
			dest[key] = src[key];
		}
	}
};