var util = require('util');

var handy = require('./handy');

var ELLIPSIS_HORIZONTAL = '\u2026',
	ELLIPSIS_VERTICAL = '\u22EE';

function Viewport(x, y, w, h, wrap) {
	this._internal = {
		x: x,
		y: y,
		w: w,
		h: h
	}
	this._text = ''; // save the text for when we have to dump is
	this._numRows = h;
	this._numColumns = w;


	this.isResizing = false;
	this.debounceResize = handy.debounce((function() {
		this.isResizing = false;
	}).bind(this), 1000);

	this.isMoving = false;
	this.debounceMoving = handy.debounce((function() {
		this.isMoving = false;
	}).bind(this), 333);
}

Viewport.prototype.move = function(dx, dy) {
	if (dx != 0 || dy != 0) {
		this.isMoving = true;
		this.debounceMoving();
	}

	if (dx < 0) {
		if (this._internal.x > 1) {
			this._internal.x--;
		}
	} else if (dx > 0) {
		// prevent a user from scrolling off the right end of a document
		if (this._internal.x < this._numColumns - (this._internal.w - 1)) {
			this._internal.x++;
		}
	}
	if (dy < 0) {
		if (this._internal.y > 1) {
			this._internal.y--;
		}
	} else if (dy > 0) {
		if (this._internal.y < this._numRows) {
			this._internal.y++;
		}
	}
};

Viewport.prototype.resize = function(w, h) {
	this.isResizing = true;
	this.debounceResize();

	this._internal.w = w;
	this._internal.h = h;
};

// reminder: x and y are 1-indexed
Viewport.prototype.render = function(text) {
	this._text = text; // save the text for when we have to dump it

	var x = this._internal.x,
		y = this._internal.y,
		w = this._internal.w,
		h = this._internal.h;

	// get the input as lines
	var srcLines = text.split(/\r?\n/);

	// set a base document size
	this._numRows = srcLines.length;
	this._numColumns = w;

	var outLines = [];
	// outLines = Array.apply(null, Array(h)).map(Number.prototype.valueOf, 0);


	// step 1: fill output with all the visible rows
	var i;
	for (i = 0; i < srcLines.length; i++) {
		var line = srcLines[i];

		// push only visible lines
		if (i >= y - 1 && i < y - 1 + h) {
			outLines.push(line);
		}

		// (sneakily) get the longest line length
		if (line.length > this._numColumns) {
			this._numColumns = line.length;
		}
	}


	// step 2: truncate lines, if nessecary (yes)
	outLines = outLines.map(function(el) {
		var out = el.substr(x - 1, w);

		// insert ellipsis to indicate following text
		if (typeof el[x - 1 + w] != 'undefined') {
			out = out.substr(0, w - 1) + ELLIPSIS_HORIZONTAL;
		}

		// insert ellipsis to indicate preceding text
		if (typeof el[x - 1 - 1] != 'undefined') {
			out = ELLIPSIS_HORIZONTAL + out.substr(1);
		}
		return out;
	});


	// step 3: add extra chars for after the end of document
	var END_OF_APP_CHAR = '%';
	// unused, we can't scroll off the right edge of a document
	// if (x + w > this._numColumns) {
	// 	for (var i = outLines[0].length; i < w; i++) {
	// 		if (x + i > this._numColumns) {
	// 			outLines[0] += END_OF_APP_CHAR;
	// 		} else {
	// 			outLines[0] += ' ';
	// 		}
	// 	}
	// }
	for (var i = outLines.length; i < h; i++) {
		outLines.push(END_OF_APP_CHAR);
	}

	return {
		lines: outLines,
		timers: {
			recentlyMoved: this.isMoving,
			recentlyResized: this.isResizing
		},
		documentSize: {
			w: this._numColumns,
			h: this._numRows
		},
		get p() {
			return 'hi';
		},
		lineStats: {
			first: {
				visible: y == 1
			},
			last: {
				visible: y + h > this._numRows,
				passed: y + h - 1 > this._numRows
			}
		}
	};
};

// just dump all the text as text, because whatever, you know?
Viewport.prototype.dump = function() {
	console.log(this._text);
};

Viewport.prototype.pos = function() {
	return {
		x: this._internal.x,
		y: this._internal.y
	};
}

Viewport.prototype.size = function() {
	return {
		w: this._internal.w,
		h: this._internal.h
	};
};

module.exports.Viewport = Viewport;