var reactty = require('..');

var view = new reactty.View('im a boring template');

setTimeout(function() {
	view.stop();
	console.log('hi there');
	console.log('how are you?');

	setTimeout(function() {
		// view.start();
		setTimeout(function() {
			view.dump();
			process.exit(0);
		}, 100);
	}, 500);
}, 100);