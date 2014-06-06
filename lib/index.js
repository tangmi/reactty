// register our helpers
require('./handlebars-helpers');
var handlebars = require('handlebars');

var Viewport = require('./viewport').Viewport;

var _ = require('lodash');

/*
console.log = function() {
	// replace console.log to print to the template (or sub-panel?)
}
 */

function View(templateSource) {
	if (!process.stdout.isTTY) {
		throw new Error('terminal is not a TTY! please fallback to normal logging schemes!');
	}

	this._template = handlebars.compile(templateSource, {
		noEscape: true
	});
	this.data = {};

	this._viewport = new Viewport(1, 1, process.stdout.columns, process.stdout.rows);

	this._components = [
		'cursor',
		'gameloop',
		'resize-listener',
		'key-input',
		'mouse-input'
	];

	this.start();
};

// set up listeners and the loop itself
View.prototype.start = function() {
	var viewport = this._viewport;

	var _this = this;
	this._components = _.map(this._components, function(el) {
		// check if all our dependencies is met
		var module = require('./components/' + el)(_this);

		return {
			name: el,
			module: module,
			dependencies: module.dependencies
		};
	});

	_.forEach(this._components, function(el) {
		console.log('enabling %s', el.name);
		el.module.enable();
	});

	// handle most exit scenarios?
	function exit() {
		process.exit(0);
	}
	// clean up handing stuff
	process.on('uncaughtException', function(e) {
		// show error, and exit program
		_this.stop();

		viewport.dump();
		console.log('\n' + e.stack);
		process.exit(1);
	});
	process.on('SIGINT', exit);
	process.on('SIGTERM', exit);
	process.on('SIGBREAK', exit);
	process.on('SIGHUP', exit);
	process.on('exit', function(code) {
		if (code != 0) {
			// we don't do favors for error codes.
			return;
		}

		_this.stop();

		// reset the cursor so we can see it again! then dump our output!
		var bar = Array.apply(null, Array(viewport.size().w)).map(function() {
			return '-'
		}).join('');
		_this._cursor
			.write('\n\n')
			.write(bar)
			.write('\n')
			.write('DUMPING OUTPUT BEFORE EXITING...')
			.write('\n')
			.write(bar)
			.write('\n\n\n\n');
		viewport.dump();
	});

	return this; // for if we ever want to chain this?
};

View.prototype.stop = function() {
	_.forEach(this._components, function(el) {
		console.log('disabling %s', el.name);
		el.module.disable();
	});
	this._stop = true;
};

module.exports.View = View;