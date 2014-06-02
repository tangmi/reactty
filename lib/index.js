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

var handy = require('./util');

var log = console.log;
/*
console.log = function() {
	// replace console.log to print to the template (or sub-panel?)
}
 */


function View(templateSource, context) {
	this.data = context || {};

	template = handlebars.compile(templateSource);

	var isResizing = false,
		debounceResize = handy.debounce(function() {
			isResizing = false;
		}, 1000);

	var h = process.stdout.rows,
		w = process.stdout.columns;
	process.stdout.on('resize', function() {
		h = process.stdout.rows;
		w = process.stdout.columns;
		isResizing = true;
		debounceResize();
	});

	var isMoving = false,
		debounceMoving = handy.debounce(function() {
			isMoving = false;
		}, 333);
	var numRows = h,
		numColumns = w;
	var viewport = {
			// lets just go with the flow and 1-index it
			x: 1,
			y: 1
		},
		moveViewport = function(dx, dy) {
			isMoving = true;
			debounceMoving();
			if (dx < 0) {
				if (viewport.x > 1) {
					viewport.x--;
				}
			} else if (dx > 0) {
				if (viewport.x < numColumns) {
					viewport.x++;
				}
			}
			if (dy < 0) {
				if (viewport.y > 1) {
					viewport.y--;
				}
			} else if (dy > 0) {
				if (viewport.y < numRows) {
					viewport.y++;
				}
			}
		};
	process.stdin.on('keypress', function(ch, key) {
		if (key && key.ctrl && key.name == 'c') {
			process.exit(0);
		}

		if (key) {
			switch (key.name) {
				case 'left':
					moveViewport(-1, 0);
					break;
				case 'right':
					moveViewport(1, 0);
					break;
				case 'up':
					moveViewport(0, -1);
					break;
				case 'down':
					moveViewport(0, 1);
					break;
			}
		}
	});

	var id = gameloop.setGameLoop((function(delta) {
		// do all calculation and stuff here
		var result = template(this.data).split(/\r?\n/);
		var visible = [];

		numRows = result.length;
		numColumns = w;

		for (var i = 0; i < result.length; i++) {
			var line = result[i];

			// grab the longest line, it becomes the new "width" of our document
			if (line.length > numColumns) {
				numColumns = line.length;
			}

			// add strings into the "visible" buffer showing only what's visible
			if (i >= viewport.y - 1 && i < viewport.y - 1 + h - 1) {
				if (i < result.length) {
					visible.push(line.substr(viewport.x - 1, w));
				}
			}
		}

		// add extra chars to denote edge of columns
		if (viewport.x + w > numColumns) {
			for (var i = visible[0].length; i < w; i++) {
				if (viewport.x + i > numColumns) {
					visible[0] = visible[0] + '%';
				} else {
					visible[0] = visible[0] + ' ';
				}
			}
		}
		// add extra chars to denote end of output
		for (var i = visible.length; i < h - 1; i++) {
			visible.push('%');
		}


		// prepare the screen for writing
		cursor.reset().show();
		cursor.eraseData(2); // idk what the parameter means? (alt? `log('\033[2J');`)
		cursor.goto(1, 1); // ansi is 1-indexed

		// actually write the result
		visible.forEach(function(line) {
			cursor.write(line).write('\n');
		});

		if (isMoving) {
			cursor
				.black()
				.bg.red()
				.goto(1, h)
				.write(util.format('(%s/%s), (%s/%s)',
					viewport.x, numColumns,
					viewport.y, numRows));
		}


		if (isResizing) {
			cursor
				.black()
				.bg.white()
				.goto(1, h)
				.write(w + ', ' + h);
		}

		cursor
			.reset()
			.goto(0, h)
			.hide();
		// process.stdout.cursorTo(w - 1, h - 1);
	}).bind(this), 1000 / 15);

	process.on('uncaughtException', function(e) {
		// show error, and exit program
		gameloop.clearGameLoop(id);
		cursor.reset();
		log('\n' + e.stack);
		process.exit(1);
	});

}

// handle most exit scenarios?
function exit() {
	process.exit(0);
}
process.on('SIGINT', exit);
process.on('SIGTERM', exit);
process.on('SIGBREAK', exit);
process.on('SIGHUP', exit);
process.on('exit', function(code) {
	// reset the cursor so we can see it again!
	cursor
		.reset()
		.show();
});

module.exports.View = View;