var fs = require('fs');
var reactty = require('..');

var view = new reactty.View(fs.readFileSync(__dirname + '/styles-template.hbs').toString());

// view.stop();