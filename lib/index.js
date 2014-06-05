var fs = require('fs'),
	util = require('util');

var ansi = require('ansi'),
	cursor = ansi(process.stdout);

var keypress = require('keypress');

// register our helpers
require('./handlebars-helpers');
var handlebars = require('handlebars');

var gameloop = require('node-gameloop');

var Viewport = require('./viewport').Viewport;

var _ = require('lodash');

var FRAME_DELAY = 1000 / 15;

var log = console.log;
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

	this._viewport = null;

	this._config = {
		// wrap: false
	};

	this._viewport = new Viewport(1, 1, process.stdout.columns, process.stdout.rows);
	this._cachedRendered = '';

	this.start();
};

// set up listeners and the loop itself
View.prototype.start = function() {
	var _config = this._config;

	var viewport = this._viewport;

	// start the loop
	var _this = this;
	var id = gameloop.setGameLoop(function() {
		// .apply is faster than .bind?
		// http://stackoverflow.com/questions/17638305/why-is-bind-slower-than-a-closure
		_this._loopfn.apply(_this, arguments);
	}, FRAME_DELAY);

	// handle resizing
	process.stdout.on('resize', function() {
		viewport.resize(process.stdout.columns, process.stdout.rows);
	});

	// handle moving
	keypress(process.stdin);
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.on('keypress', function(ch, key) {
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
	});

	process.on('uncaughtException', function(e) {
		// show error, and exit program
		gameloop.clearGameLoop(id);
		cursor.reset().show().eraseData(2);
		viewport.dump();
		log('\n' + e.stack);
		process.exit(1);
	});

	// handle most exit scenarios?
	function exit() {
		process.exit(0);
	}
	process.on('SIGINT', exit);
	process.on('SIGTERM', exit);
	process.on('SIGBREAK', exit);
	process.on('SIGHUP', exit);
	process.on('exit', function(code) {
		if (code != 0) {
			// we don't do favors for error codes.
			return;
		}

		// reset the cursor so we can see it again! then dump our output!
		var bar = Array.apply(null, Array(viewport.size().w)).map(function() {
			return '-'
		}).join('');
		console.log(bar);
		cursor
			.reset()
			.show()
			.eraseData(2)
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

// actually the loop function. not sure if this should be actually hidden
// or just hidden by convention
View.prototype._loopfn = function(delta) {
	var viewport = this._viewport;
	// do all calculation and stuff here
	var result = this._template(this.data);

	var rendered = viewport.render(result);

	var visible = rendered.lines;

	// prevent redrawing if whats rendered hasn't changed
	// TODO: make this a little better than a string comparison?
	if (_.isEqual(this._cachedRendered, rendered)) {
		return;
	}
	this._cachedRendered = rendered;


	// prepare the screen for writing
	cursor.reset().show();
	cursor.eraseData(2); // idk what the parameter means? (alt? `log('\033[2J');`)
	cursor.goto(1, 1); // ansi is 1-indexed

	// actually write the result
	visible.forEach(function(line, i) {
		cursor.goto(1, i + 1).write(line);
	});

	// render position if recently moved
	if (rendered.timers.recentlyMoved) {
		var size = viewport.size(),
			pos = viewport.pos();
		var xposMsg = util.format('(x=%s/%s), ', pos.x, rendered.documentSize.w - size.w + 1),
			yposMsg = util.format('(y=%s/%s)', pos.y, rendered.documentSize.h);

		cursor
			.black()
			.bg.white()
			.goto(size.w - (xposMsg + yposMsg).length, size.h);
		cursor.write(xposMsg + yposMsg);
	}


	// 'scrollbar' rendering (just arrows?)
	var more = {
		up: '\u25B2',
		down: '\u25BC'
	};
	// var more = {
	//	//more compact arrows w/ text
	// 	up: 'more\u25B4',
	// 	down: 'more\u25BE'
	// };
	if (!rendered.lineStats.last.visible) {
		var moreMsg = more.down;
		cursor
			.black()
			.bg.white()
			.goto(viewport.size().w - moreMsg.length + 1, viewport.size().h)
			.write(moreMsg);
	}
	if (!rendered.lineStats.first.visible) {
		var moreMsg = more.up;
		cursor
			.black()
			.bg.white()
			.goto(viewport.size().w - moreMsg.length + 1, 1)
			.write(moreMsg);
	}

	// if (isResizing) {
	// 	cursor
	// 		.black()
	// 		.bg.white()
	// 		.goto(1, viewport.size().h)
	// 		.write(viewport.size().w + ', ' + viewport.size().h);
	// }

	cursor
		.reset()
		.goto(0, viewport.size().h + 1)
		.hide();
};

View.prototype.config = function() {
	if (arguments.length == 0) {
		return;
	}
	var args = Array.prototype.slice.call(arguments);
	if (arguments.length == 1) {
		// havent tested with lodash
		_.merge(this._config, [this._config, args[0]]);
	} else if (arguments.length == 2) {
		var obj = {};
		obj[args[0]] = args[1];
		_.merge(this._config, [this._config, obj]);
	}
};

module.exports.View = View;