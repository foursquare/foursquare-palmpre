function OauthAssistant(fp) {
	this.fromPrefs=fp;
}

//https://foursquare.com/oauth2/authenticate?client_id=OCLXBFYUDCOGQVILNNN1RZMEI4HDS5VQGY5QASRYILPQTFFI&response_type=code&redirect_uri=http://zhephree.com/foursquare/callback

OauthAssistant.prototype.setup = function() {
	if(_globals.isTouchPad()){
		logthis("touchpad!");
		var theURL=(this.fromPrefs)? 'http://foursquare.com/logout': 'https://foursquare.com/oauth2/authenticate?client_id=OCLXBFYUDCOGQVILNNN1RZMEI4HDS5VQGY5QASRYILPQTFFI&response_type=token&redirect_uri=http://zhephree.com/foursquare/callback';
	}else{
		var theURL=(this.fromPrefs)? 'http://foursquare.com/logout': 'https://foursquare.com/oauth2/authenticate?client_id=OCLXBFYUDCOGQVILNNN1RZMEI4HDS5VQGY5QASRYILPQTFFI&response_type=token&display=touch&redirect_uri=http://zhephree.com/foursquare/callback';
	
	}
	this.controller.setupWidget("WebId",
	    this.attributes = {
	        url:    theURL,
	        minFontSize:18
	    },
	    this.model = {
	    }
	); 
    Mojo.Event.listen(this.controller.get('WebId'), Mojo.Event.webViewTitleUrlChanged, this.titleChanged.bind(this));
//    Mojo.Event.listen(this.controller.get('WebId'), Mojo.Event.webViewUrlRedirect, this.titleChanged.bind(this));
    Mojo.Event.listen(this.controller.get("WebId"), Mojo.Event.webViewLoadStopped, this.loadStopped.bind(this));
    Mojo.Event.listen(this.controller.get("WebId"), Mojo.Event.webViewLoadStarted, this.loadStarted.bind(this));

    //Mojo.Event.listen(this.controller.get('WebId'), Mojo.Event.webViewUrlChanged, this.titleChanged.bind(this));

};

OauthAssistant.prototype.loadStarted = function(event) {
	logthis("url="+event.url);
	this.controller.get("tooltip").show();
};

OauthAssistant.prototype.loadStopped = function(event) {
	this.controller.get("tooltip").hide();
};
OauthAssistant.prototype.titleChanged = function(event) {
	logthis("url changed");
	logthis("url="+event.url);
	event.stop();
	event.preventDefault();
    var callbackUrl=event.url;
    var responseVars=callbackUrl.split("#access_token=");
	if(responseVars[0] == "http://zhephree.com/foursquare/callback" || responseVars[0] == "http://zhephree.com/foursquare/callback/"){
		logthis("token="+responseVars[1]);
		this.cookieData=new Mojo.Model.Cookie("oauth");
		this.cookieData.put({
			token: responseVars[1]
		});
		this.controller.stageController.popScenesTo('main',{token:responseVars[1]});
	}else if((responseVars[0]=="http://foursquare.com" || responseVars[0]=="http://foursquare.com/") && responseVars[0].indexOf("logout")==-1){		
//		if(_globals.isTouchPad()){
//			setTimeout(function(){this.controller.get("WebId").mojo.stopLoad();this.controller.get("WebId").mojo.openURL("https://foursquare.com/oauth2/authenticate?client_id=OCLXBFYUDCOGQVILNNN1RZMEI4HDS5VQGY5QASRYILPQTFFI&response_type=token&redirect_uri=http://zhephree.com/foursquare/callback");}.bind(this),500);
//		}else{
			setTimeout(function(){this.controller.get("WebId").mojo.stopLoad();this.controller.get("WebId").mojo.openURL("https://foursquare.com/oauth2/authenticate?client_id=OCLXBFYUDCOGQVILNNN1RZMEI4HDS5VQGY5QASRYILPQTFFI&response_type=token&display=touch&redirect_uri=http://zhephree.com/foursquare/callback");}.bind(this),500);
		
//		}
			
/*	}else if(responseVars[0].indexOf("logout")!=-1){
		setTimeout(function(){this.controller.get("WebId").mojo.stopLoad();this.controller.get("WebId").mojo.openURL("https://foursquare.com/oauth2/authenticate?client_id=OCLXBFYUDCOGQVILNNN1RZMEI4HDS5VQGY5QASRYILPQTFFI&response_type=token&display=touch&redirect_uri=http://zhephree.com/foursquare/callback");}.bind(this),500);*/
	
	}else{
		logthis(responseVars[0]);
	}
};

OauthAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   	//this.controller.get("WebId").mojo.addUrlRedirect(/http:\/\/zhephree.com\/foursquare\/callback/gi,true,"",1);
	   	//this.controller.get("WebId").mojo.addUrlRedirect("http://zhephree.com/foursquare/callback",true,"",1);

};

OauthAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

OauthAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
