var _ = require('lodash');

var EXIT_EVENTS = [
	'SIGINT',
	'SIGTERM',
	'SIGBREAK',
	'SIGHUP'
];

module.exports = function(view) {
	var viewport = view._viewport;

	function enable() {
		// handle most exit scenarios?

		process.addListener('uncaughtException', handleUncaughtException);
		_.forEach(EXIT_EVENTS, function(e) {
			process.addListener(e, exit);
		});
		process.addListener('exit', dumpAndExit);
	}

	function disable() {
		process.removeListener('uncaughtException', handleUncaughtException);
		_.forEach(EXIT_EVENTS, function(e) {
			process.removeListener(e, exit);
		});
		process.removeListener('exit', dumpAndExit);
	}

	function handleUncaughtException(e) {
		// show error, and exit program
		view.stop();

		viewport.dump();
		console.log('\n' + e.stack);
		process.exit(1);
	}

	function exit() {
		process.exit(0);
	}

	function dumpAndExit(code) {
		if (code != 0) {
			// we don't do favors for error codes.
			return;
		}

		view.stop();

		// reset the cursor so we can see it again! then dump our output!
		var bar = Array.apply(null, Array(viewport.size().w)).map(function() {
			return '-'
		}).join('');
		view._cursor
			.write('\n\n')
			.write(bar)
			.write('\n')
			.write('DUMPING OUTPUT BEFORE EXITING...')
			.write('\n')
			.write(bar)
			.write('\n\n');
		viewport.dump();
	}

	return {
		enable: enable,
		disable: disable
	};
};