var Handlebars = require('handlebars');

var chalk = require('chalk');

var _ = require('lodash');

var styles = [
	'reset',
	'bold',
	'italic',
	'underline',
	'inverse',
	'strikethrough'
];

var colors = [
	'black',
	'red',
	'green',
	'yellow',
	'blue',
	'magenta',
	'cyan',
	'white',
	'gray'
];

var bgColors = [
	'bgBlack',
	'bgRed',
	'bgGreen',
	'bgYellow',
	'bgBlue',
	'bgMagenta',
	'bgCyan',
	'bgWhite'
];

// register styles
var stylesWrap = _(styles)
	.forEach(function(style) {
		Handlebars.registerHelper(style, function(options) {
			return chalk[style](options.fn(this));
		});
	});

// allow for shorthand (first char)
stylesWrap
	.filter(function(style) {
		// return false;
		return ['bold', 'italic', 'underline'].indexOf(style) != -1;
	})
	.forEach(function(style) {
		Handlebars.registerHelper(style[0], function(options) {
			return chalk[style](options.fn(this));
		});
	});

// register foreground colors
Handlebars.registerHelper('fg', function(color, options) {
	color = color.toLowerCase();
	if (colors.indexOf(color) != -1) {
		return chalk[color](options.fn(this));
	} else {
		return options.fn(this);
	}
});

// register background colors
Handlebars.registerHelper('bg', function(color, options) {
	color = color.toLowerCase();
	color = 'bg' + color[0].toUpperCase() + color.substr(1);
	if (bgColors.indexOf(color) != -1) {
		return chalk[color](options.fn(this));
	} else {
		return options.fn(this);
	}
});