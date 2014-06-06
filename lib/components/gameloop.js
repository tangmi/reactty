var util = require('util');

var _ = require('lodash');

var gameloop = require('node-gameloop');

module.exports = function(view) {

	var loopId;
	var viewport = view._viewport;
	var _cachedRendered;
	var FRAME_DELAY = 1000 / 15;

	function enable() {
		loopId = gameloop.setGameLoop(loopfn, FRAME_DELAY);
	}

	function disable() {
		gameloop.clearGameLoop(loopId);
		loopId = null;
	}

	function loopfn(delta) {
		var cursor = view._cursor;

		// do all calculation and stuff here
		var result = view._template(view.data);

		var rendered = viewport.render(result);

		var visible = rendered.lines;

		// prevent redrawing if whats rendered hasn't changed
		// TODO: make this a little better than a string comparison?
		if (_.isEqual(_cachedRendered, rendered)) {
			return;
		}
		_cachedRendered = rendered;

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

		// if (view._stop) {
		//	// don't just quit, stop the game loop gracefully and
		//	// allow the program to continue as normal
		// 	process.exit(0);
		// }
	};

	return {
		dependencies: ['cursor'],
		enable: enable,
		disable: disable
	};
};