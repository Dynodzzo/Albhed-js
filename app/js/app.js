var app = {};

app.tbxInputText = (function() {
	var $this = $('input#tbxInputText');
	
	var init = function() {
		$this.bind('change', onChange);
	}
	
	var onChange = function() {
		console.log('tbxInputText value changed');
		console.log(getValue());
	}
	
	var getValue = function() {
		return $this.val();
	};
	
	return {
		'init': init,
		'getValue': getValue,	
	};
})();

$(document).bind('ready', function() {
	console.log('DOM ready');
	app.tbxInputText.init();
});