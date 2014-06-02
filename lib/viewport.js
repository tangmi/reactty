var util = require('util');

var handy = require('./handy');

function Viewport(x, y, w, h) {
	this._internal = {
		x: x,
		y: y,
		w: w,
		h: h
	}
	this.text = '';
}

Viewport.prototype.update = function(text) {
	this.text = text;
}

Viewport.prototype.move = function(dx, dy) {
	if (dx < 0) {
		if (this._internal.x > 1) {
			this._internal.x--;
		}
	} else if (dx > 0) {
		if (this._internal.x < numColumns) {
			this._internal.x++;
		}
	}
	if (dy < 0) {
		if (this._internal.y > 1) {
			this._internal.y--;
		}
	} else if (dy > 0) {
		if (this._internal.y < numRows) {
			this._internal.y++;
		}
	}
}

Viewport.prototype.resize = function(w, h) {
	this._internal.w = w;
	this._internal.h = h;
};

// reminder: x and y are 1-indexed
Viewport.prototype.lines = function() {
	var x = this._internal.x,
		y = this._internal.y,
		w = this._internal.w,
		h = this._internal.h;

	return [x, y, w, h];
}

module.exports.Viewport = Viewport;