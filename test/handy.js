var assert = require('assert');

var handy = require('../lib/handy');

var config = {
	'sup': 'duper',
	'setting': 1
};

assert.equal(config.sup, 'duper');
assert.equal(config.setting, 1);

handy.merge({
	'sup': 'not duper'
}, config);

assert.equal(config.sup, 'not duper');
assert.equal(config.setting, 1);

handy.merge({
	'setting': 2,
	'hm': 'not work'
}, config);

assert.equal(config.sup, 'not duper');
assert.equal(config.setting, 2);
assert.equal(typeof config.hm, 'undefined');
