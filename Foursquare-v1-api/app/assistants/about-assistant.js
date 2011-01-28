function AboutAssistant() {
	if(_globals.debugMode){
		this.debugTaps=0;
	}else{
		this.debugTaps=0;
	}
}

AboutAssistant.prototype.setup = function() {
	this.controller.get("about-header").innerHTML="ABOUT FOURSQUARE v"+Mojo.appInfo.version;
//	this.controller.get("about-main").style.background="#1e1e1e url(images/darker-bg.png) repeat left top";
	//zBar.hideToolbar();
	this.controller.document.getElementsByTagName("body")[0].style.background="url(../images/grey-bg.png) top left";
	NavMenu.setup(this,{buttons:'empty'});
	
	this.handleDebugTapBound=this.handleDebugTap.bind(this);
	Mojo.Event.listen(this.controller.get("legal-head"),Mojo.Event.hold,this.handleDebugTapBound);

	
	if(_globals.debugMode){this.controller.get("legal-head").innerHTML+="debug";}
}
AboutAssistant.prototype.getUA = function(event) {
		var request = new Ajax.Request("http://zhephree.com/foursquare/ua.php", {
	   method: 'get',
	   evalJSON: 'true',
	   requestHeaders: {Authorization:auth,"User-Agent":"tetsing user agent"},
	   onSuccess: this.yay.bind(this)
	 });

}

AboutAssistant.prototype.handleDebugTap = function(event){
	var str="debug";
	if(!_globals.debugMode){
		_globals.debugMode=true;
		Mojo.Controller.getAppController().showBanner("Debug Mode enabled!", {source: 'notification'});	
	}else{
		_globals.debugMode=false;
		Mojo.Controller.getAppController().showBanner("Debug Mode disabled!", {source: 'notification'});	
	}
};

AboutAssistant.prototype.yay = function(event) {
	logthis(event.responseText);
}
AboutAssistant.prototype.activate = function(event) {
}


AboutAssistant.prototype.deactivate = function(event) {
}

AboutAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  // zBar.showToolbar();
	Mojo.Event.stopListening(this.controller.get("legal-head"),Mojo.Event.tap,this.handeDebugTapBound);

}
