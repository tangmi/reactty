var fs = require('fs');
var reactty = require('..');

var view = new reactty.View(fs.readFileSync(__dirname + '/styles-template.hbs').toString());

setTimeout(function() {
	// view.start();
	// throw new Error;
},100);