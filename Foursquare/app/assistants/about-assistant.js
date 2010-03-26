function AboutAssistant() {
}

AboutAssistant.prototype.setup = function() {
	this.controller.get("about-header").innerHTML="About Foursquare v"+Mojo.appInfo.version;
	zBar.hideToolbar();

}
AboutAssistant.prototype.getUA = function(event) {
		var request = new Ajax.Request("http://zhephree.com/foursquare/ua.php", {
	   method: 'get',
	   evalJSON: 'true',
	   requestHeaders: {Authorization:auth,"User-Agent":"tetsing user agent"},
	   onSuccess: this.yay.bind(this)
	 });

}
AboutAssistant.prototype.yay = function(event) {
	Mojo.Log.error(event.responseText);
}
AboutAssistant.prototype.activate = function(event) {
}


AboutAssistant.prototype.deactivate = function(event) {
}

AboutAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	   zBar.showToolbar();
}
