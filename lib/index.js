var fs = require('fs'),
	util = require('util');

var ansi = require('ansi'),
	cursor = ansi(process.stdout);

var keypress = require('keypress');
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

var handlebars = require('handlebars');
var gameloop = require('node-gameloop');

var Viewport = require('./viewport').Viewport;

var handy = require('./handy');

var log = console.log;
/*
console.log = function() {
	// replace console.log to print to the template (or sub-panel?)
}
 */

function View(templateSource, context) {
	if (!process.stdout.isTTY) {
		throw new Error('terminal is not a TTY! please fallback to normal logging schemes!');
	}

	this._template = handlebars.compile(templateSource);
	this.data = context || {};

	this._viewport = null;

	this._config = {
		// wrap: false
	};

	this.start();
};

View.prototype.start = function() {
	var _config = this._config;

	this._viewport = new Viewport(1, 1, process.stdout.columns, process.stdout.rows);
	var viewport = this._viewport;

	// handle resizing
	process.stdout.on('resize', function() {
		viewport.resize(process.stdout.columns, process.stdout.rows);
	});

	// handle moving
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

	// the main loop thing
	var id = gameloop.setGameLoop((function(delta) {
			// do all calculation and stuff here
			var result = this._template(this.data);

			var rendered = viewport.render(result);

			var visible = rendered.lines;

			// prepare the screen for writing
			cursor.reset().show();
			cursor.eraseData(2); // idk what the parameter means? (alt? `log('\033[2J');`)
			cursor.goto(1, 1); // ansi is 1-indexed

			// actually write the result
			visible.forEach(function(line, i) {
				cursor.goto(1, i + 1).write(line);
			});

			if (rendered.timers.recentlyMoved) {
				var size = viewport.size(),
					pos = viewport.pos();

				cursor
					.black()
					.bg.red()
					.goto(1, size.h);

				// write x pos
				cursor.write(util.format('(%s/%s), ', pos.x, viewport._numColumns - size.w + 1));
				// write y pos
				cursor.write(util.format('(%s/%s)', pos.y, viewport._numRows));
			}


			// 'scrollbar'
			var more = {
				up: '\u25B2',
				down: '\u25BC'
			};
			// var more = {
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
		}).bind(this),
		1000 / 15);


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

View.prototype.config = function() {
	if (arguments.length == 0) {
		return;
	}
	var args = Array.prototype.slice.call(arguments);
	if (arguments.length == 1) {
		handy.merge(args[0], this._config);
	} else if (arguments.length == 2) {
		var obj = {};
		obj[args[0]] = args[1];
		handy.merge(obj, this._config);
	}
};

module.exports.View = View;