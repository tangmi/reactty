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
		'mouse-input',
		'exit'
	];

	// require all the components
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

	this.start();
};

// set up listeners and the loop itself
View.prototype.start = function() {
	_.forEach(this._components, function(el) {
		// console.log('enabling %s', el.name);
		el.module.enable();
	});
	return this; // for if we ever want to chain this?
};

View.prototype.stop = function() {
	_.forEach(this._components, function(el) {
		// console.log('disabling %s', el.name);
		el.module.disable();
	});
	return this;
};

// View.prototype.pause = function() {
// 	this.stop();
// 	this._cursor.eraseData(2).goto(1, 1);
// 	return this;
// };

// View.prototype.resume = View.prototype.start;

View.prototype.dump = function() {
	this._viewport.dump();
};

module.exports.View = View;