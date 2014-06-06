var ansi = require('ansi'),
	cursor = ansi(process.stdout);

module.exports = function(view) {
	function enable() {
		view._cursor = cursor;
	}

	function disable() {
		cursor.reset().show();
	}

	return {
		enable: enable,
		disable: disable
	};
};