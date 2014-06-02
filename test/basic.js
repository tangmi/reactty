var fs = require('fs');
var reactty = require('..');

var view = new reactty.View(fs.readFileSync(__dirname + '/simple-template.hbs').toString());

// view.config('wrap', true); // haven't figured out how to architech a solution for this yet


setTimeout(function() {
	view.data = {
		"name": "Alan",
		"hometown": "Somewhere, TX",
		"kids": [{
			"name": "Jimmy",
			"age": "12"
		}, {
			"name": "Sally",
			"age": "4"
		}],
	};

	setInterval(function() {
		view.data.time = +new Date();
	}, 1000);
}, 2000);

setTimeout(function() {
	throw new Error('it also handles errors!');
}, 20000);