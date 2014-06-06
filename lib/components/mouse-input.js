var keypress = require('keypress');

module.exports = function(view) {
	var viewport = view._viewport;

	function enable() {
		keypress.enableMouse(process.stdout);
		process.stdin.addListener('mousepress', handleMouse);
	}

	function disable() {
		keypress.disableMouse(process.stdout);
		process.stdin.removeListener('mousepress', handleMouse);
	}

	function handleMouse(info) {
		viewport.move(0, info.scroll);
	}

	return {
		dependencies: ['key-input'], // unused currently
		enable: enable,
		disable: disable
	};
};