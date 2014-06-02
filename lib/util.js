module.exports.debounce = function(fn, timeout) {
	var id;
	var fn2 = function() {
		fn.apply(this, arguments);
		id = null;
	}
	return function() {
		if(!id) {
			id = setTimeout(fn2, timeout);
		} else {
			clearTimeout(id);
			id = setTimeout(fn2, timeout);
		}
	}
};