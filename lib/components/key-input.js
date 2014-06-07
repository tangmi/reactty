var keypress = require('keypress');

module.exports = function(view) {
	keypress(process.stdin);

	var viewport = view._viewport;

	function enable() {
		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.addListener('keypress', handleKey);
	}

	function disable() {
		process.stdin.setRawMode(false);
		process.stdin.pause();
		process.stdin.removeListener('keypress', handleKey);
	}

	function handleKey(ch, key) {
		if (key && key.ctrl && key.name == 'c') {
			// quit on inturrupt
			process.exit(0);
		}

		if (key) {
			switch (key.name) {
				case 'left':
					viewport.move(-1, 0);
					break;
				case 'right':
					viewport.move(1, 0);
					break;
				case 'up':
					viewport.move(0, -1);
					break;
				case 'down':
					viewport.move(0, 1);
					break;
			}
		}
	}

	return {
		enable: enable,
		disable: disable
	};
};