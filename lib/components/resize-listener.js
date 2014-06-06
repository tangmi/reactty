module.exports = function(view) {
	var viewport = view._viewport;

	function enable() {
		process.stdout.addListener('resize', handleResize);
	}

	function disable() {
		process.stdout.removeListener('resize', handleResize);
	}

	function handleResize() {
		viewport.resize(process.stdout.columns, process.stdout.rows);
	}

	return {
		enable: enable,
		disable: disable
	};
};